import { Cycle, PhaseKey } from "@/types/cycle.types";
import { PatternInsight } from "@/types/insights.types";
import { DailyLog, MoodCheckIn } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";

import estimateCycle from "../estimation/estimateCycle";
import { phaseLabelWithArticle } from "../estimation/phaseLabels";
import { toIsoDate } from "../shared/cycleDate.utils";
import { average } from "../shared/cycleMath.utils";
import { countLimitingPainDays, summarizeTopSymptoms } from "../shared/cycleSummary.utils";
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
    const highestPain = findPhaseExtreme(phaseBuckets, "pain", "max");
    const lowestEnergy = findPhaseExtreme(phaseBuckets, "energy", "min");
    const highestStress = findPhaseExtreme(phaseBuckets, "stress", "max");
    const spmInsight = buildSpmPatternInsight(settings, cycles, dailyLogs, todayIso);
    const topSymptoms = summarizeTopSymptoms(dailyLogs, 2);
    const limitingPainDays = countLimitingPainDays(dailyLogs);
    const medicationRoughDays = dailyLogs.filter(
        (log) => log.details?.medicationRelief === "partly_helped" || log.details?.medicationRelief === "did_not_help",
    ).length;

    if (highestPain && highestPain.average >= 2.8) {
        insights.push({
            id: "phase-pain",
            title: `Dolor más alto en ${phaseLabelWithArticle(highestPain.phase)}`,
            detail: `Promedio ${highestPain.average.toFixed(1)}/5 en ${highestPain.count} momentos. Sirve comparar qué lo acompaña en esa fase.`,
            tone: "watch",
        });
    }

    if (lowestEnergy && lowestEnergy.average <= 3) {
        insights.push({
            id: "phase-energy",
            title: `Energía más baja en ${phaseLabelWithArticle(lowestEnergy.phase)}`,
            detail: `Promedio ${lowestEnergy.average.toFixed(1)}/5 en ${lowestEnergy.count} momentos. Ahí vale mirar sueño, carga mental y dolor.`,
            tone: "supportive",
        });
    }

    if (highestStress && highestStress.average >= 2.8) {
        insights.push({
            id: "phase-stress",
            title: `Estrés más alto en ${phaseLabelWithArticle(highestStress.phase)}`,
            detail: `Promedio ${highestStress.average.toFixed(1)}/5 en ${highestStress.count} momentos. Conviene ver si coincide con menos descanso o más dolor.`,
            tone: "watch",
        });
    }

    if (spmInsight) {
        insights.push(spmInsight);
    }

    if (topSymptoms[0] && topSymptoms[0].count >= 2) {
        insights.push({
            id: "top-symptom",
            title: `Síntoma que más se repite: ${topSymptoms[0].label}`,
            detail: `Aparece en ${topSymptoms[0].count} días registrados. Si vuelve a repetirse, ya deja de ser dato aislado.`,
            tone: "supportive",
        });
    }

    if (limitingPainDays > 0) {
        insights.push({
            id: "pain-impact",
            title: `Dolor que sí frenó tu día: ${limitingPainDays}`,
            detail: `Ya no es solo molestia leve. Vale ver si cae siempre en el mismo tramo del ciclo.`,
            tone: "watch",
        });
    }

    if (medicationRoughDays > 0) {
        insights.push({
            id: "medication-relief",
            title: `Alivio parcial o nulo: ${medicationRoughDays} días`,
            detail: `Te da una señal concreta para comparar qué tan manejable fue ese dolor de un ciclo a otro.`,
            tone: "watch",
        });
    }

    return insights.slice(0, 5);
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
        const phase = estimateCycle(settings, cycles, dailyLogs, iso).phase;
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
