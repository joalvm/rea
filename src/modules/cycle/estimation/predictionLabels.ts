import { translate } from "@/modules/localization/i18n";
import { CycleSnapshot, PhaseKey, PhaseSource, PredictionConfidence } from "@/types/cycle.types";
import { AppSettings } from "@/types/settings.types";

interface ConfidenceNoteContext {
    observedBleedingToday: boolean;
    observedInputToday: boolean;
    source: CycleSnapshot["source"];
}

/** Devuelve label legible para origen de snapshot. */
export function getSourceLabel(source: CycleSnapshot["source"]) {
    if (source === "observed") {
        return translate("common:sources.observed");
    }

    if (source === "estimated") {
        return translate("common:sources.estimated");
    }

    return translate("common:sources.unknown");
}

/** Devuelve label legible para base actual de la fase mostrada. */
export function getPhaseSourceLabel(source: PhaseSource) {
    if (source === "observed_signals") {
        return translate("cycle:phaseSource.observed");
    }

    if (source === "history_anchor") {
        return translate("cycle:phaseSource.history");
    }

    return translate("cycle:phaseSource.initial");
}

/** Devuelve label legible para nivel de confianza. */
export function getConfidenceLabel(confidence: PredictionConfidence) {
    if (confidence === "high") {
        return translate("cycle:confidence.high");
    }

    if (confidence === "medium") {
        return translate("cycle:confidence.medium");
    }

    return translate("cycle:confidence.low");
}

/** Explica por qué snapshot tiene cierto nivel de confianza. */
export function getConfidenceNote(
    settings: AppSettings | null,
    confidence: PredictionConfidence,
    observedCycleCount: number,
    { observedBleedingToday, observedInputToday, source }: ConfidenceNoteContext,
) {
    if (observedBleedingToday) {
        return settings?.hormonalContraception
            ? translate("cycle:confidenceNote.bleedingHormonal")
            : translate("cycle:confidenceNote.bleedingObserved");
    }

    if (settings?.hormonalContraception) {
        return observedInputToday
            ? translate("cycle:confidenceNote.hormonalObserved")
            : translate("cycle:confidenceNote.hormonalUnobserved");
    }

    if (observedInputToday) {
        if (source === "unknown") {
            return translate("cycle:confidenceNote.observedUnknown");
        }

        return confidence === "low"
            ? translate("cycle:confidenceNote.observedLow")
            : translate("cycle:confidenceNote.observedEstimated");
    }

    if (confidence === "high") {
        return translate("cycle:confidenceNote.high", { count: observedCycleCount });
    }

    if (confidence === "medium") {
        return translate("cycle:confidenceNote.medium", { count: observedCycleCount });
    }

    return observedCycleCount <= 1
        ? translate("cycle:confidenceNote.initialFirst")
        : translate("cycle:confidenceNote.partial", { count: observedCycleCount });
}

/** Describe rango esperado para siguiente periodo. */
export function getNextPeriodLabel(
    nextPeriodInDays: number,
    variabilityDays: number,
    confidence: PredictionConfidence,
    source: CycleSnapshot["source"],
) {
    if (source === "unknown") {
        return translate("cycle:nextPeriod.unknown");
    }

    if (confidence === "high" && variabilityDays <= 2) {
        return translate("cycle:nextPeriod.clearRange", { count: nextPeriodInDays });
    }

    const halfRange = Math.max(1, Math.ceil(variabilityDays / 2));
    const start = Math.max(1, nextPeriodInDays - halfRange);
    const end = nextPeriodInDays + halfRange;
    return translate("cycle:nextPeriod.range", { end, start });
}

/** Describe estado visible de ventana fértil. */
export function getFertilityStatusLabel(
    cycleDay: number,
    fertileStart: number,
    cycleLength: number,
    phase: PhaseKey,
    fertilityVisible: boolean,
    _confidence: PredictionConfidence,
    settings: AppSettings | null,
) {
    if (!fertilityVisible) {
        return settings?.hormonalContraception
            ? translate("cycle:fertilityStatus.hidden")
            : translate("cycle:fertilityStatus.notPrioritized");
    }

    if (phase === "fertile") {
        return translate("cycle:fertilityStatus.now");
    }

    const daysToFertility = getDaysToFertility(cycleDay, fertileStart, cycleLength);
    return translate("cycle:fertilityStatus.inDays", { count: daysToFertility });
}

function getDaysToFertility(cycleDay: number, fertileStart: number, cycleLength: number) {
    if (cycleDay < fertileStart) {
        return fertileStart - cycleDay;
    }

    return cycleLength - cycleDay + fertileStart;
}
