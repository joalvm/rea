import { translate } from "@/modules/localization/i18n";
import { CycleSnapshot, PhaseKey, PredictionConfidence } from "@/types/cycle.types";
import { AppSettings } from "@/types/settings.types";

import { findLastOnOrBefore } from "../../utils/cycleObservedData.utils";

interface PhaseMessageContext {
    phase: PhaseKey;
    source: CycleSnapshot["source"];
    nextPeriodInDays: number;
    fertilityVisible: boolean;
    settings: AppSettings | null;
}

/** Determina fase estimada a partir del día de ciclo y reglas visibles. */
export function getPhase(
    cycleDay: number,
    periodLength: number,
    fertileStart: number,
    fertileEnd: number,
    fertilityVisible: boolean,
    isObservedBleeding: boolean,
): PhaseKey {
    if (isObservedBleeding) {
        return "menstrual";
    }

    if (cycleDay <= periodLength) {
        return "menstrual";
    }

    if (fertilityVisible && cycleDay >= fertileStart && cycleDay <= fertileEnd) {
        return "fertile";
    }

    if (cycleDay < fertileStart) {
        return "follicular";
    }

    return "luteal";
}

/** Redacta mensaje principal del snapshot actual del ciclo. */
export function getPhaseMessage({
    phase,
    source,
    nextPeriodInDays,
    fertilityVisible,
    settings,
}: PhaseMessageContext): string {
    if (settings?.hormonalContraception) {
        return translate("cycle:phaseMessage.hormonal");
    }

    if (source === "unknown") {
        return translate("cycle:phaseMessage.unknown");
    }

    switch (phase) {
        case "menstrual":
            return source === "observed"
                ? translate("cycle:phaseMessage.menstrualObserved")
                : translate("cycle:phaseMessage.menstrualEstimated");
        case "follicular":
            return translate("cycle:phaseMessage.follicular");
        case "fertile":
            return fertilityVisible
                ? translate("cycle:phaseMessage.fertileVisible")
                : translate("cycle:phaseMessage.fertileHidden");
        case "luteal":
            return translate("cycle:phaseMessage.luteal", { count: nextPeriodInDays });
    }
}

/** Decide si la base del snapshot es observada, estimada o desconocida. */
export function getSnapshotSource(
    observedBleedingDates: Set<string>,
    observedStarts: string[],
    todayIso: string,
): CycleSnapshot["source"] {
    if (observedBleedingDates.has(todayIso)) {
        return "observed";
    }

    if (findLastOnOrBefore(observedStarts, todayIso)) {
        return "estimated";
    }

    return "unknown";
}

/** Resume confianza de predicción según datos y regularidad declarada. */
export function getPredictionConfidence(
    settings: AppSettings | null,
    observedCycleCount: number,
    measuredCycleCount: number,
    observedBleedingToday: boolean,
    observedInputToday: boolean,
): PredictionConfidence {
    if (observedBleedingToday) {
        return "high";
    }

    if (settings?.hormonalContraception) {
        return "low";
    }

    let score = 0;
    if (measuredCycleCount >= 3) {
        score += 2;
    } else if (measuredCycleCount >= 1) {
        score += 1;
    }

    if (observedCycleCount >= 3) {
        score += 1;
    }

    if (settings?.regularity === "variable") {
        score -= 1;
    }

    if (settings?.regularity === "irregular") {
        score -= 2;
    }

    if (score >= 3) {
        return "high";
    }

    if (score >= 1) {
        return "medium";
    }

    if (observedInputToday && observedCycleCount >= 1) {
        return "medium";
    }

    return "low";
}

/** Estima margen esperado de variación para próxima regla. */
export function getVariabilityDays(values: number[], settings: AppSettings | null) {
    if (values.length >= 2) {
        return Math.max(...values) - Math.min(...values);
    }

    if (settings?.regularity === "irregular") {
        return 6;
    }

    if (settings?.regularity === "variable") {
        return 4;
    }

    return 2;
}
