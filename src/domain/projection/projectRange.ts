import type { MenstruationBasis, EstimatedPhase, PhaseSource } from "@/db/enums/dailySummary";
import type { InsertDailySummary } from "@/db/schema/dailySummary";
import { addDays } from "@/domain/cycle/utils/addDays";
import { diffInDays } from "@/domain/cycle/utils/diffInDays";
import type { CyclePredictionResult } from "@/domain/cycle/types/CyclePredictionResult";
import type { CycleWindow } from "@/domain/cycle/types/CycleWindow";
import type { ReproductiveIntentFact } from "@/domain/cycle/types/ReproductiveIntentFact";

import type { CheckinProjectionFact, SymptomEntry } from "./types/CheckinProjectionFact";
import type { PregnancyEpisodeFact } from "./types/PregnancyEpisodeFact";

/**
 * Proyecta `daily_summary`: un row completo por día en `[from, to]`. Determinista
 * e idempotente — no usa `Date.now()` ni estado externo, `updatedAt` lo estampa el
 * llamador. Sin I/O: el orquestador (Fase 3) resuelve hechos y persiste las filas.
 *
 * `prediction` es una única instantánea vigente para todo el rango (calculada por
 * `predictNextCycle` con los supuestos actuales); un cambio de intención a mitad de
 * rango no recalcula la ventana fértil retroactivamente aquí — reproyectar desde el
 * punto de cambio es responsabilidad de `recalculate` (Fase 3).
 */
export function projectRange(input: {
    profileId: string;
    from: string;
    to: string;
    updatedAt: string;
    cycles: CycleWindow[];
    prediction: CyclePredictionResult;
    checkinsByDate: Record<string, CheckinProjectionFact[]>;
    intentHistory: ReproductiveIntentFact[];
    pregnancyEpisodes: PregnancyEpisodeFact[];
    intercourseDates: Set<string>;
}): InsertDailySummary[] {
    return enumerateDates(input.from, input.to).map((date) => {
        const dayCheckins = input.checkinsByDate[date] ?? [];
        const includedCheckins = dayCheckins.filter((checkin) => !checkin.excludedFromSummary);

        const activeIntent = findActiveIntent(input.intentHistory, date);
        // El modo declarado es la señal primaria (espeja `isPaused` en Fase 1); la
        // fecha del episodio es una segunda señal defensiva por si el modo aún no
        // se actualizó (p. ej. episodio cargado con fecha retroactiva).
        const isPregnancyDay =
            activeIntent?.reproductiveMode === "pregnancy_tracking" ||
            input.pregnancyEpisodes.some((episode) => isWithinRange(date, episode.startDate, episode.endDate));

        const cycle = findCycleForDate(input.cycles, date);
        const { isMenstruationDay, menstruationBasis, isSpottingDay } = computeMenstruation(cycle, date, dayCheckins);

        const predictedOvulation = input.prediction?.predictedOvulation ?? null;
        const isOvulationDay = predictedOvulation !== null && predictedOvulation === date;
        const ovulationConfirmed = isOvulationDay && input.prediction?.ovulationBasis !== "calendar";

        const fertileWindow = input.prediction?.fertileWindow ?? null;
        const isFertileDay =
            fertileWindow !== null &&
            !fertileWindow.suppressed &&
            date >= fertileWindow.start &&
            date <= fertileWindow.end;

        const cyclePosition: CyclePosition =
            predictedOvulation === null
                ? "unknown"
                : date < predictedOvulation
                  ? "before_ovulation"
                  : "after_ovulation";

        const { estimatedPhase, phaseSource } = computePhase({
            isPregnancyDay,
            isMenstruationDay,
            menstruationBasis,
            isFertileDay,
            isOvulationDay,
            cyclePosition,
        });

        const symptoms = includedCheckins.flatMap((checkin) => checkin.symptoms);
        const { maxSymptomIntensity, topSymptomKey } = pickTopSymptom(symptoms);

        const reliefScores = includedCheckins
            .flatMap((checkin) => checkin.medications)
            .map((medication) => medication.relief)
            .filter((relief): relief is number => relief !== null);

        const summary: InsertDailySummary = {
            profileId: input.profileId,
            localDate: date,
            isMenstruationDay,
            menstruationBasis,
            isSpottingDay,
            isFertileDay,
            ovulationConfirmed,
            isPregnancyDay,
            pregnancyWeek: null,
            pregnancyTrimester: null,
            hadMedication: dayCheckins.some((checkin) => checkin.medications.length > 0),
            hadIntercourse: input.intercourseDates.has(date),
            avgMood: average(includedCheckins.map((checkin) => checkin.mood).filter(isNumber)),
            avgEnergy: average(includedCheckins.map((checkin) => checkin.energy).filter(isNumber)),
            avgStress: average(includedCheckins.map((checkin) => checkin.stressLevel).filter(isNumber)),
            maxPain: maxOf(includedCheckins.map((checkin) => checkin.painIntensity).filter(isNumber)),
            maxSymptomIntensity,
            topSymptomKey,
            medicationReliefScore: average(reliefScores),
            estimatedPhase,
            phaseSource,
            phaseConfidence: input.prediction?.confidence ?? "low",
            cycleDay: cycle ? diffInDays(cycle.startDate, date) + 1 : null,
            checkinCount: dayCheckins.length,
            updatedAt: input.updatedAt,
        };

        return summary;
    });
}

type CyclePosition = "before_ovulation" | "after_ovulation" | "unknown";

function enumerateDates(from: string, to: string): string[] {
    const totalDays = diffInDays(from, to);
    const dates: string[] = [];

    for (let offset = 0; offset <= totalDays; offset++) {
        dates.push(addDays(from, offset));
    }

    return dates;
}

function isWithinRange(date: string, start: string, end: string | null): boolean {
    return date >= start && (end === null || date <= end);
}

function findActiveIntent(intentHistory: ReproductiveIntentFact[], date: string): ReproductiveIntentFact | null {
    return intentHistory
        .filter((intent) => isWithinRange(date, intent.effectiveFrom, intent.effectiveTo))
        .reduce<ReproductiveIntentFact | null>((latest, candidate) => {
            if (!latest || candidate.effectiveFrom > latest.effectiveFrom) {
                return candidate;
            }
            return latest;
        }, null);
}

function findCycleForDate(cycles: CycleWindow[], date: string): CycleWindow | null {
    return cycles.find((cycle) => isWithinRange(date, cycle.startDate, cycle.endDate)) ?? null;
}

function computeMenstruation(
    cycle: CycleWindow | null,
    date: string,
    dayCheckins: CheckinProjectionFact[],
): { isMenstruationDay: boolean; menstruationBasis: MenstruationBasis; isSpottingDay: boolean } {
    if (cycle) {
        // Racha aún abierta (sin fin confirmado): todo día desde el inicio cuenta
        // como sangrado confirmado hasta que se conozca un cierre.
        const periodEnd = cycle.periodLength !== null ? addDays(cycle.startDate, cycle.periodLength - 1) : null;
        const confirmedByPeriod = periodEnd === null || date <= periodEnd;

        if (confirmedByPeriod) {
            return { isMenstruationDay: true, menstruationBasis: "confirmed_period", isSpottingDay: false };
        }
    }

    const included = dayCheckins.filter((checkin) => !checkin.excludedFromSummary);
    const hasPeriodSignal = included.some(
        (checkin) => checkin.periodStatusSignal === "started" || checkin.periodStatusSignal === "ongoing",
    );

    if (hasPeriodSignal) {
        return { isMenstruationDay: true, menstruationBasis: "inferred_bleeding", isSpottingDay: false };
    }

    const hasBleeding = included.some((checkin) => (checkin.bleedingIntensity ?? 0) >= 1);
    return { isMenstruationDay: false, menstruationBasis: "none", isSpottingDay: hasBleeding };
}

function computePhase(input: {
    isPregnancyDay: boolean;
    isMenstruationDay: boolean;
    menstruationBasis: MenstruationBasis;
    isFertileDay: boolean;
    isOvulationDay: boolean;
    cyclePosition: CyclePosition;
}): { estimatedPhase: EstimatedPhase; phaseSource: PhaseSource } {
    // Semana/trimestre de embarazo es del plan 09: aquí solo se marca `isPregnancyDay`.
    if (input.isPregnancyDay) {
        return { estimatedPhase: "unknown", phaseSource: "unknown" };
    }

    if (input.isMenstruationDay) {
        return {
            estimatedPhase: "menstrual",
            phaseSource: input.menstruationBasis === "confirmed_period" ? "observed" : "estimated",
        };
    }

    if (input.isOvulationDay) {
        return { estimatedPhase: "estimated_ovulation", phaseSource: "estimated" };
    }

    if (input.isFertileDay) {
        return { estimatedPhase: "fertile_window", phaseSource: "estimated" };
    }

    if (input.cyclePosition === "before_ovulation") {
        return { estimatedPhase: "follicular", phaseSource: "estimated" };
    }

    if (input.cyclePosition === "after_ovulation") {
        return { estimatedPhase: "luteal", phaseSource: "estimated" };
    }

    return { estimatedPhase: "unknown", phaseSource: "unknown" };
}

/**
 * Síntoma principal del día: mayor intensidad, luego menor `uiPriority`, luego
 * `symptomKey` (empate determinista).
 */
function pickTopSymptom(symptoms: SymptomEntry[]): { maxSymptomIntensity: number; topSymptomKey: string | null } {
    const [top] = [...symptoms].sort((a, b) => {
        if (b.intensity !== a.intensity) {
            return b.intensity - a.intensity;
        }
        if (a.uiPriority !== b.uiPriority) {
            return a.uiPriority - b.uiPriority;
        }
        return a.symptomKey < b.symptomKey ? -1 : a.symptomKey > b.symptomKey ? 1 : 0;
    });

    return top
        ? { maxSymptomIntensity: top.intensity, topSymptomKey: top.symptomKey }
        : { maxSymptomIntensity: 0, topSymptomKey: null };
}

function isNumber(value: number | null): value is number {
    return value !== null;
}

function average(values: number[]): number | null {
    return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function maxOf(values: number[]): number | null {
    return values.length > 0 ? Math.max(...values) : null;
}
