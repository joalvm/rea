import { Cycle, CycleSnapshot, PhaseKey, PredictionConfidence } from "../../../types/cycle.types";
import { DailyLog } from "../../../types/records.types";
import { AppSettings } from "../../../types/settings.types";

import buildWeek from "../calendar/buildWeek";
import {
    findCurrentAnchorStart,
    findLastOnOrBefore,
    getObservedBleedingDates,
    getObservedCycleLengths,
    getObservedCycleStarts,
    getObservedPeriodRuns,
} from "../shared/cycleObservedData.utils";
import { addDays, daysBetween, toIsoDate } from "../shared/cycleDate.utils";
import { roundOrFallback } from "../shared/cycleMath.utils";
import getPhaseLabel from "./phaseLabels";
import {
    getConfidenceLabel,
    getConfidenceNote,
    getFertilityStatusLabel,
    getNextPeriodLabel,
    getSourceLabel,
} from "./predictionLabels";

/** Estima snapshot de ciclo actual o futuro usando datos observados. */
export default function estimateCycle(
    settings: AppSettings | null,
    cycles: Cycle[] = [],
    dailyLogs: DailyLog[] = [],
    todayIso = toIsoDate(new Date()),
): CycleSnapshot {
    const fallbackStart = addDays(todayIso, -1);
    const observedBleedingDates = getObservedBleedingDates(dailyLogs);
    const observedRuns = getObservedPeriodRuns(dailyLogs);
    const observedStarts = getObservedCycleStarts(settings, cycles, observedRuns);
    const observedCycleLengths = getObservedCycleLengths(observedStarts);
    const observedPeriodLengths = observedRuns.map((run) => run.length);

    const cycleLength = roundOrFallback(observedCycleLengths, settings?.cycleLength ?? 28, 21, 40);
    const periodLength = roundOrFallback(observedPeriodLengths, settings?.periodLength ?? 5, 2, 10);
    const fertilityVisible = !settings?.hormonalContraception && settings?.goal !== "track_only";
    const confidence = getPredictionConfidence(settings, observedStarts.length, observedCycleLengths.length);
    const anchorStart = findCurrentAnchorStart(observedRuns, observedStarts, settings, todayIso) ?? fallbackStart;
    const source = getSnapshotSource(observedBleedingDates, observedStarts, todayIso);
    const diff = daysBetween(anchorStart, todayIso);
    const cycleDay = (((diff % cycleLength) + cycleLength) % cycleLength) + 1;
    const ovulationDay = Math.max(10, cycleLength - 14);
    const fertileStart = Math.max(1, ovulationDay - 5);
    const fertileEnd = Math.min(cycleLength, ovulationDay + 1);
    const nextPeriodInDays = cycleLength - cycleDay + 1;
    const variabilityDays = getVariabilityDays(observedCycleLengths, settings);
    const phase = getPhase(
        cycleDay,
        periodLength,
        fertileStart,
        fertileEnd,
        fertilityVisible,
        observedBleedingDates.has(todayIso),
    );
    const week = buildWeek(
        todayIso,
        cycleDay,
        periodLength,
        fertileStart,
        fertileEnd,
        cycleLength,
        observedBleedingDates,
        fertilityVisible,
    );

    return {
        cycleDay,
        phase,
        source,
        sourceLabel: getSourceLabel(source),
        confidence,
        confidenceLabel: getConfidenceLabel(confidence),
        confidenceNote: getConfidenceNote(settings, confidence, observedStarts.length),
        phaseLabel: getPhaseLabel(phase),
        phaseMessage: getPhaseMessage({
            phase,
            source,
            confidence,
            nextPeriodInDays,
            fertilityVisible,
            settings,
        }),
        nextPeriodInDays,
        nextPeriodLabel: getNextPeriodLabel(nextPeriodInDays, variabilityDays, confidence, source),
        fertileWindowLabel: getFertilityStatusLabel(
            cycleDay,
            fertileStart,
            cycleLength,
            phase,
            fertilityVisible,
            confidence,
            settings,
        ),
        fertilityVisible,
        fertilityStatusLabel: getFertilityStatusLabel(
            cycleDay,
            fertileStart,
            cycleLength,
            phase,
            fertilityVisible,
            confidence,
            settings,
        ),
        observedCycleCount: observedStarts.length,
        cycleLengthEstimate: cycleLength,
        periodLengthEstimate: periodLength,
        week,
    };
}

function getPhase(
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

function getPhaseMessage({
    phase,
    source,
    confidence,
    nextPeriodInDays,
    fertilityVisible,
    settings,
}: {
    phase: PhaseKey;
    source: CycleSnapshot["source"];
    confidence: PredictionConfidence;
    nextPeriodInDays: number;
    fertilityVisible: boolean;
    settings: AppSettings | null;
}): string {
    if (settings?.hormonalContraception) {
        return "Con anticonceptivos hormonales esta vista es orientativa. Priorizamos tus registros sobre calendario.";
    }

    if (source === "unknown") {
        return "Base inicial. Marca periodos reales para pasar de referencia suave a seguimiento mas confiable.";
    }

    if (confidence === "low") {
        return "Todavía depende bastante de tu fecha inicial. Cuantos más periodos reales marques, mejor ajusta.";
    }

    switch (phase) {
        case "menstrual":
            return source === "observed"
                ? "Hoy cuenta como observación real de sangrado. Úsalo para ajustar mejor tu ciclo."
                : "Esta etapa se sigue comparando contra tus registros. Flujo, dolor y energía ayudan a afinarla.";
        case "follicular":
            return "Etapa de recuperación orientativa. Lo útil aquí es comparar energía, sueño y ánimo con tus registros.";
        case "fertile":
            return fertilityVisible
                ? "Ventana fértil orientativa. Si buscas precisión, combina señales reales como moco cervical, temperatura o test."
                : "Seguimos mostrando referencia de ciclo, pero no una ventana fértil activa en este modo.";
        case "luteal":
            return `Próxima regla estimada en ${nextPeriodInDays} días. Observa sueño, ánimo y estrés para comparar este tramo.`;
    }
}

function getSnapshotSource(
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

function getPredictionConfidence(
    settings: AppSettings | null,
    observedCycleCount: number,
    measuredCycleCount: number,
): PredictionConfidence {
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

    return "low";
}

function getVariabilityDays(values: number[], settings: AppSettings | null) {
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
