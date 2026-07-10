import { diffInDays } from "@/domain/cycle/utils/diffInDays";

import { shouldMergePeriodRuns } from "./shouldMergePeriodRuns";
import type { PeriodCheckinFact } from "./types/PeriodCheckinFact";
import type { PeriodRunSnapshot } from "./types/PeriodRunSnapshot";
import type { ReconciliationAction } from "./types/ReconciliationAction";

/** Intensidad mínima de sangrado que cuenta como regla real (spotting = 1 nunca infiere). */
const MIN_INFERENCE_BLEEDING_INTENSITY = 2;

/** Días sin sangrado real, sumados a la duración declarada, que disparan el prompt de inactividad. */
const INACTIVITY_BUFFER_DAYS = 3;

/** Duración de periodo asumida cuando la usuaria no declaró ninguna en onboarding. */
const DEFAULT_ASSUMED_PERIOD_LENGTH_DAYS = 6;

export type ReconcilePeriodStateFacts = {
    periodRuns: PeriodRunSnapshot[];
    checkins: PeriodCheckinFact[];
    declaredPeriodLength: number | null;
};

function isHeavyBleeding(checkin: PeriodCheckinFact): boolean {
    return (checkin.bleedingIntensity ?? 0) >= MIN_INFERENCE_BLEEDING_INTENSITY;
}

function lastHeavyBleedingDate(checkins: PeriodCheckinFact[], sinceDate: string): string | null {
    const heavyDates = checkins
        .filter((checkin) => checkin.localDate >= sinceDate && isHeavyBleeding(checkin))
        .map((checkin) => checkin.localDate)
        .sort();

    return heavyDates.at(-1) ?? null;
}

function isDateCoveredByAnyRun(date: string, periodRuns: PeriodRunSnapshot[]): boolean {
    return periodRuns.some((run) => {
        if (run.status === "excluded") {
            return false;
        }

        const runEnd = run.endDate ?? date;

        return date >= run.startDate && date <= runEnd;
    });
}

function reconcileOpenRun(
    open: PeriodRunSnapshot,
    facts: ReconcilePeriodStateFacts,
    today: string,
): ReconciliationAction {
    const checkinsSinceStart = facts.checkins.filter((checkin) => checkin.localDate >= open.startDate);
    const lastHeavyDate = lastHeavyBleedingDate(checkinsSinceStart, open.startDate) ?? open.startDate;

    const endSignal = checkinsSinceStart.find((checkin) => checkin.periodStatusSignal === "ended");

    if (endSignal !== undefined) {
        return { type: "proponer_cierre", endDate: lastHeavyDate, reason: "signal_ended" };
    }

    const declaredPeriodLength = facts.declaredPeriodLength ?? DEFAULT_ASSUMED_PERIOD_LENGTH_DAYS;
    const inactivityThresholdDays = declaredPeriodLength + INACTIVITY_BUFFER_DAYS;
    const daysSinceLastHeavyBleeding = diffInDays(lastHeavyDate, today);

    if (daysSinceLastHeavyBleeding >= inactivityThresholdDays) {
        return { type: "proponer_cierre", endDate: lastHeavyDate, reason: "inactivity_prompt" };
    }

    return { type: "nada" };
}

function reconcileWithoutOpenRun(facts: ReconcilePeriodStateFacts): ReconciliationAction {
    const candidateStart = facts.checkins
        .filter((checkin) => isHeavyBleeding(checkin) && !isDateCoveredByAnyRun(checkin.localDate, facts.periodRuns))
        .map((checkin) => checkin.localDate)
        .sort()
        .at(0);

    if (candidateStart === undefined) {
        return { type: "nada" };
    }

    const lastClosedRun = facts.periodRuns
        .filter((run) => run.status === "closed" && run.endDate !== null)
        .sort((a, b) => ((a.endDate ?? "") < (b.endDate ?? "") ? 1 : -1))
        .at(0);

    if (lastClosedRun?.endDate != null && shouldMergePeriodRuns(lastClosedRun.endDate, candidateStart)) {
        return {
            type: "proponer_fusión",
            closedRunEndDate: lastClosedRun.endDate,
            newStartDate: candidateStart,
            gapDays: diffInDays(lastClosedRun.endDate, candidateStart),
        };
    }

    return { type: "proponer_inicio", startDate: candidateStart, source: "bleeding_inferred" };
}

/**
 * Decide qué proponerle a la usuaria sobre el estado de su racha de periodo,
 * como función pura (plan 03, Fase 1). Nunca escribe ni asume confirmación: el
 * llamador decide si mostrar la propuesta y una mutación explícita la aplica.
 *
 * Solo hay una racha abierta a la vez (`uq_period_runs_single_open`), así que las
 * reglas de cierre/inactividad y las de inicio/fusión son mutuamente excluyentes.
 */
export function reconcilePeriodState(facts: ReconcilePeriodStateFacts, today: string): ReconciliationAction {
    const openRun = facts.periodRuns.find((run) => run.status === "open");

    if (openRun !== undefined) {
        return reconcileOpenRun(openRun, facts, today);
    }

    return reconcileWithoutOpenRun(facts);
}
