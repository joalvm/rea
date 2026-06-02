import { Cycle, CycleSnapshot } from "@/types/cycle.types";
import { DailyLog, MoodCheckIn } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";
import { translate } from "@/modules/localization/i18n";

import buildWeek from "../calendar/buildWeek";
import {
    findCurrentAnchorStart,
    getObservedBleedingDates,
    getObservedCycleLengths,
    getObservedCycleStarts,
    getObservedPeriodRuns,
} from "../utils/cycleObservedData.utils";
import { addDays, daysBetween, toIsoDate } from "../utils/cycleDate.utils";
import { roundOrFallback } from "../utils/cycleMath.utils";
import { labelSymptom } from "../utils/symptomCatalog";
import {
    getPhase,
    getPhaseMessage,
    getPredictionConfidence,
    getSnapshotSource,
    getVariabilityDays,
} from "./helpers/estimateCycle.helpers";
import getPhaseLabel from "./phaseLabels";
import {
    getConfidenceLabel,
    getConfidenceNote,
    getFertilityStatusLabel,
    getNextPeriodLabel,
    getPhaseSourceLabel,
    getSourceLabel,
} from "./predictionLabels";

/** Estima snapshot de ciclo actual o futuro usando datos observados. */
export default function estimateCycle(
    settings: AppSettings | null,
    cycles: Cycle[] = [],
    dailyLogs: DailyLog[] = [],
    todayIso = toIsoDate(new Date()),
    moodCheckIns: MoodCheckIn[] = [],
): CycleSnapshot {
    const fallbackStart = addDays(todayIso, -1);
    const observedBleedingDates = getObservedBleedingDates(dailyLogs);
    const observedRuns = getObservedPeriodRuns(dailyLogs);
    const observedStarts = getObservedCycleStarts(settings, cycles, observedRuns);
    const observedCycleLengths = getObservedCycleLengths(observedStarts);
    const observedPeriodLengths = observedRuns.map((run) => run.length);

    const cycleLength = roundOrFallback(observedCycleLengths, settings?.cycleLength ?? 28, 21, 40);
    const periodLength = roundOrFallback(observedPeriodLengths, settings?.periodLength ?? 5, 2, 10);
    const fertilityVisible = !settings?.hormonalContraception && Boolean(settings?.tryingToConceive);
    const anchorStart = findCurrentAnchorStart(observedRuns, observedStarts, settings, todayIso) ?? fallbackStart;
    const observedBleedingToday = observedBleedingDates.has(todayIso);
    const observedInputToday = hasObservedInputToday(dailyLogs, moodCheckIns, todayIso);
    const source = getSnapshotSource(observedBleedingDates, observedStarts, todayIso);
    const activeSignals = getActiveSignals(dailyLogs, moodCheckIns, todayIso);
    const phaseSource = getPhaseSource(dailyLogs, moodCheckIns, observedBleedingDates, observedStarts, todayIso);
    const confidence = getPredictionConfidence(
        settings,
        observedStarts.length,
        observedCycleLengths.length,
        observedBleedingToday,
        observedInputToday,
    );
    const diff = daysBetween(anchorStart, todayIso);
    const cycleDay = (((diff % cycleLength) + cycleLength) % cycleLength) + 1;
    const ovulationDay = Math.max(10, cycleLength - 14);
    const fertileStart = Math.max(1, ovulationDay - 5);
    const fertileEnd = Math.min(cycleLength, ovulationDay + 1);
    const nextPeriodInDays = cycleLength - cycleDay + 1;
    const variabilityDays = getVariabilityDays(observedCycleLengths, settings);
    const phase = getPhase(cycleDay, periodLength, fertileStart, fertileEnd, fertilityVisible, observedBleedingToday);
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
    const confidenceReason = getConfidenceNote(settings, confidence, observedStarts.length, {
        observedBleedingToday,
        observedInputToday,
        source,
    });

    return {
        cycleDay,
        phase,
        source,
        phaseSource,
        sourceLabel: getSourceLabel(source),
        phaseSourceLabel: getPhaseSourceLabel(phaseSource),
        confidence,
        confidenceLabel: getConfidenceLabel(confidence),
        confidenceNote: confidenceReason,
        confidenceReason,
        phaseLabel: getPhaseLabel(phase),
        phaseMessage: getPhaseMessage({
            phase,
            source,
            nextPeriodInDays,
            fertilityVisible,
            settings,
        }),
        anchorDate: source === "unknown" ? null : anchorStart,
        activeSignals,
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

function getPhaseSource(
    dailyLogs: DailyLog[],
    moodCheckIns: MoodCheckIn[],
    observedBleedingDates: Set<string>,
    observedStarts: string[],
    todayIso: string,
): CycleSnapshot["phaseSource"] {
    if (observedBleedingDates.has(todayIso) || hasObservedInputToday(dailyLogs, moodCheckIns, todayIso)) {
        return "observed_signals";
    }

    if (observedStarts.length > 0) {
        return "history_anchor";
    }

    return "initial_setup";
}

function getActiveSignals(dailyLogs: DailyLog[], moodCheckIns: MoodCheckIn[], todayIso: string) {
    const todayLog = dailyLogs.find((log) => log.date === todayIso);
    const todayCheckIns = moodCheckIns.filter((item) => item.datetime.startsWith(todayIso));
    const signals: string[] = [];

    if (todayLog?.bleedingLevel && todayLog.bleedingLevel !== "none") {
        signals.push(bleedingSignalLabel(todayLog.bleedingLevel));
    }

    if (todayLog?.details?.periodStarted) {
        signals.push(translate("cycle:activeSignals.periodStarted"));
    }

    if (todayLog?.details?.periodEnded) {
        signals.push(translate("cycle:activeSignals.periodEnded"));
    }

    if (todayLog?.symptoms?.length) {
        signals.push(...todayLog.symptoms.slice(0, 2).map((symptom) => labelSymptom(symptom)));
    }

    if (todayLog?.details?.pmsState === "starting") {
        signals.push(translate("cycle:activeSignals.pmsStarting"));
    }

    if (todayLog?.details?.pmsState === "present") {
        signals.push(translate("cycle:activeSignals.pmsPresent"));
    }

    if (todayLog?.details?.painImpact === "limits_day" || todayLog?.details?.painImpact === "stops_day") {
        signals.push(translate("cycle:activeSignals.painLimiting"));
    }

    if (todayCheckIns.some((item) => item.pain >= 4)) {
        signals.push(translate("cycle:activeSignals.painHigh"));
    }

    if (todayCheckIns.some((item) => item.energy >= 4)) {
        signals.push(translate("cycle:activeSignals.energyHigh"));
    }

    if (todayCheckIns.some((item) => item.mood <= 2)) {
        signals.push(translate("cycle:activeSignals.moodLow"));
    }

    return [...new Set(signals)].slice(0, 4);
}

function hasObservedInputToday(dailyLogs: DailyLog[], moodCheckIns: MoodCheckIn[], todayIso: string) {
    const todayLog = dailyLogs.find((log) => log.date === todayIso);
    const hasObservedDailyLog = Boolean(todayLog && (todayLog.source ?? "observed") === "observed");
    const hasCheckIn = moodCheckIns.some((item) => item.datetime.startsWith(todayIso));

    return hasObservedDailyLog || hasCheckIn;
}

function bleedingSignalLabel(level: DailyLog["bleedingLevel"]) {
    if (level === "spotting") {
        return translate("cycle:activeSignals.bleedingSpotting");
    }

    if (level === "light") {
        return translate("cycle:activeSignals.bleedingLight");
    }

    if (level === "medium") {
        return translate("cycle:activeSignals.bleedingMedium");
    }

    return translate("cycle:activeSignals.bleedingHeavy");
}
