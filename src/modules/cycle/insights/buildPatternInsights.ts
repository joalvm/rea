import { translate } from "@/modules/localization/i18n";
import { Cycle, PhaseKey } from "@/types/cycle.types";
import { PatternInsight } from "@/types/insights.types";
import { DailyLog, MoodCheckIn } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";

import estimateCycle from "../estimation/estimateCycle";
import { phaseLabelWithArticle } from "../estimation/phaseLabels";
import {
    getObservedCycleLengths,
    getObservedCycleStarts,
    getObservedPeriodRuns,
} from "../utils/cycleObservedData.utils";
import { toIsoDate } from "../utils/cycleDate.utils";
import { average } from "../utils/cycleMath.utils";
import { countLimitingPainDays, summarizeTopSymptoms } from "../utils/cycleSummary.utils";
import buildSpmPatternInsight from "./buildSpmPatternInsight";

type PhaseBucket = {
    mood: number[];
    energy: number[];
    pain: number[];
    stress: number[];
};

type PhaseMetricKey = keyof PhaseBucket;

/** Construye insights comparativos por fase usando historial observado. */
export default function buildPatternInsights(
    settings: AppSettings | null,
    cycles: Cycle[],
    dailyLogs: DailyLog[],
    moodCheckIns: MoodCheckIn[],
): PatternInsight[] {
    const insights: PatternInsight[] = [];
    const todayIso = toIsoDate(new Date());
    const phaseBuckets = buildPhaseBuckets(settings, cycles, dailyLogs, moodCheckIns);
    const ttcInsight = buildTryingToConceiveInsight(settings, cycles, dailyLogs);
    const highestPain = findPhaseExtreme(phaseBuckets, "pain", "max");
    const lowestEnergy = findPhaseExtreme(phaseBuckets, "energy", "min");
    const highestStress = findPhaseExtreme(phaseBuckets, "stress", "max");
    const spmInsight = buildSpmPatternInsight(settings, cycles, dailyLogs, todayIso);
    const topSymptoms = summarizeTopSymptoms(dailyLogs, 2);
    const limitingPainDays = countLimitingPainDays(dailyLogs);
    const medicationRoughDays = dailyLogs.filter(
        (log) => log.details?.medicationRelief === "partly_helped" || log.details?.medicationRelief === "did_not_help",
    ).length;

    if (ttcInsight) {
        insights.push(ttcInsight);
    }

    if (highestPain && highestPain.average >= 2.8) {
        insights.push({
            id: "phase-pain",
            title: translate("cycle:insights.phasePain.title", {
                phase: phaseLabelWithArticle(highestPain.phase),
            }),
            detail: translate("cycle:insights.phasePain.detail", {
                average: highestPain.average.toFixed(1),
                count: highestPain.count,
            }),
            tone: "watch",
        });
    }

    if (lowestEnergy && lowestEnergy.average <= 3) {
        insights.push({
            id: "phase-energy",
            title: translate("cycle:insights.phaseEnergy.title", {
                phase: phaseLabelWithArticle(lowestEnergy.phase),
            }),
            detail: translate("cycle:insights.phaseEnergy.detail", {
                average: lowestEnergy.average.toFixed(1),
                count: lowestEnergy.count,
            }),
            tone: "supportive",
        });
    }

    if (highestStress && highestStress.average >= 2.8) {
        insights.push({
            id: "phase-stress",
            title: translate("cycle:insights.phaseStress.title", {
                phase: phaseLabelWithArticle(highestStress.phase),
            }),
            detail: translate("cycle:insights.phaseStress.detail", {
                average: highestStress.average.toFixed(1),
                count: highestStress.count,
            }),
            tone: "watch",
        });
    }

    if (spmInsight) {
        insights.push(spmInsight);
    }

    if (topSymptoms[0] && topSymptoms[0].count >= 2) {
        insights.push({
            id: "top-symptom",
            title: translate("cycle:insights.topSymptom.title", { symptom: topSymptoms[0].label }),
            detail: translate("cycle:insights.topSymptom.detail", { count: topSymptoms[0].count }),
            tone: "supportive",
        });
    }

    if (limitingPainDays > 0) {
        insights.push({
            id: "pain-impact",
            title: translate("cycle:insights.painImpact.title", { count: limitingPainDays }),
            detail: translate("cycle:insights.painImpact.detail"),
            tone: "watch",
        });
    }

    if (medicationRoughDays > 0) {
        insights.push({
            id: "medication-relief",
            title: translate("cycle:insights.medicationRelief.title", { count: medicationRoughDays }),
            detail: translate("cycle:insights.medicationRelief.detail"),
            tone: "watch",
        });
    }

    return insights.slice(0, 5);
}

function buildTryingToConceiveInsight(
    settings: AppSettings | null,
    cycles: Cycle[],
    dailyLogs: DailyLog[],
): PatternInsight | null {
    if (!settings?.tryingToConceive) {
        return null;
    }

    if (settings.hormonalContraception) {
        return {
            id: "ttc-paused",
            title: translate("cycle:insights.tryingToConceive.pausedTitle"),
            detail: translate("cycle:insights.tryingToConceive.pausedDetail"),
            tone: "supportive",
        };
    }

    const observedRuns = getObservedPeriodRuns(dailyLogs);
    const observedStarts = getObservedCycleStarts(settings, cycles, observedRuns);
    const cycleLengths = getObservedCycleLengths(observedStarts);

    if (cycleLengths.length < 3) {
        return {
            id: "ttc-low-basis",
            title: translate("cycle:insights.tryingToConceive.lowBasisTitle"),
            detail: translate("cycle:insights.tryingToConceive.lowBasisDetail"),
            tone: "supportive",
        };
    }

    const minLength = Math.min(...cycleLengths);
    const maxLength = Math.max(...cycleLengths);
    const variability = maxLength - minLength;

    if (variability <= 4) {
        return {
            id: "ttc-stable-window",
            title: translate("cycle:insights.tryingToConceive.stableTitle"),
            detail: translate("cycle:insights.tryingToConceive.stableDetail", {
                count: cycleLengths.length,
                max: maxLength,
                min: minLength,
            }),
            tone: "supportive",
        };
    }

    return {
        id: "ttc-variable-window",
        title: translate("cycle:insights.tryingToConceive.variableTitle"),
        detail: translate("cycle:insights.tryingToConceive.variableDetail", {
            count: cycleLengths.length,
            variability,
        }),
        tone: "watch",
    };
}

function buildPhaseBuckets(
    settings: AppSettings | null,
    cycles: Cycle[],
    dailyLogs: DailyLog[],
    moodCheckIns: MoodCheckIn[],
): Map<PhaseKey, PhaseBucket> {
    const buckets = new Map<PhaseKey, PhaseBucket>();

    moodCheckIns.forEach((item) => {
        const iso = toIsoDate(new Date(item.datetime));
        const phase = estimateCycle(settings, cycles, dailyLogs, iso, moodCheckIns).phase;
        const bucket = buckets.get(phase) ?? { mood: [], energy: [], pain: [], stress: [] };
        bucket.mood.push(item.mood);
        bucket.energy.push(item.energy);
        bucket.pain.push(item.pain);
        bucket.stress.push(item.stress);
        buckets.set(phase, bucket);
    });

    return buckets;
}

function findPhaseExtreme(
    buckets: Map<PhaseKey, PhaseBucket>,
    metric: PhaseMetricKey,
    direction: "min" | "max",
): { phase: PhaseKey; average: number; count: number } | null {
    let winner: { phase: PhaseKey; average: number; count: number } | null = null;

    buckets.forEach((bucket, phase) => {
        const values = bucket[metric] as number[];
        if (values.length < 2) {
            return;
        }

        const current = { phase, average: average(values), count: values.length };
        if (!winner) {
            winner = current;
            return;
        }

        if (direction === "max" && current.average > winner.average) {
            winner = current;
        }

        if (direction === "min" && current.average < winner.average) {
            winner = current;
        }
    });

    return winner;
}
