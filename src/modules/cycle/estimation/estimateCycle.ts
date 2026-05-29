import { Cycle, CycleSnapshot } from "../../../types/cycle.types";
import { DailyLog } from "../../../types/records.types";
import { AppSettings } from "../../../types/settings.types";

import buildWeek from "../calendar/buildWeek";
import {
    findCurrentAnchorStart,
    getObservedBleedingDates,
    getObservedCycleLengths,
    getObservedCycleStarts,
    getObservedPeriodRuns,
} from "../shared/cycleObservedData.utils";
import { addDays, daysBetween, toIsoDate } from "../shared/cycleDate.utils";
import { roundOrFallback } from "../shared/cycleMath.utils";
import {
    getPhase,
    getPhaseMessage,
    getPredictionConfidence,
    getSnapshotSource,
    getVariabilityDays,
} from "./estimateCycle.helpers";
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
    const fertilityStatusLabel = getFertilityStatusLabel(
        cycleDay,
        fertileStart,
        cycleLength,
        phase,
        fertilityVisible,
        confidence,
        settings,
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
        fertileWindowLabel: fertilityStatusLabel,
        fertilityVisible,
        fertilityStatusLabel,
        observedCycleCount: observedStarts.length,
        cycleLengthEstimate: cycleLength,
        periodLengthEstimate: periodLength,
        week,
    };
}
