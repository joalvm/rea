import { useMemo } from "react";

import buildEducationalAlerts from "@/modules/cycle/alerts/buildEducationalAlerts";
import estimateCycle from "@/modules/cycle/estimation/estimateCycle";
import buildPatternInsights from "@/modules/cycle/insights/buildPatternInsights";
import { summarizeTopSymptoms } from "@/modules/cycle/utils/cycleSummary.utils";
import buildCycleSummaries from "@/modules/cycle/summaries/buildCycleSummaries";
import { colors } from "@/theme";
import { Cycle } from "@/types/cycle.types";
import { DailyLog, MoodCheckIn } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";

interface UsePatternsModelParams {
    settings: AppSettings | null;
    cycles: Cycle[];
    moodCheckIns: MoodCheckIn[];
    dailyLogs: DailyLog[];
}

const METRICS: {
    key: keyof Pick<MoodCheckIn, "mood" | "energy" | "pain" | "stress">;
    label: string;
    color: string;
}[] = [
    { key: "mood", label: "Ánimo", color: colors.primary },
    { key: "energy", label: "Energía", color: colors.fertile },
    { key: "pain", label: "Dolor", color: colors.period },
    { key: "stress", label: "Estrés", color: colors.luteal },
];

/** Junta derivados, métricas y copy de estado que alimentan la pantalla de patrones. */
export default function usePatternsModel({ settings, cycles, moodCheckIns, dailyLogs }: UsePatternsModelParams) {
    const insights = useMemo(
        () => buildPatternInsights(settings, cycles, dailyLogs, moodCheckIns),
        [cycles, dailyLogs, moodCheckIns, settings],
    );
    const alerts = useMemo(
        () => buildEducationalAlerts(settings, cycles, dailyLogs, moodCheckIns),
        [cycles, dailyLogs, moodCheckIns, settings],
    );
    const cycleSummaries = useMemo(
        () => buildCycleSummaries(settings, cycles, dailyLogs, 6),
        [cycles, dailyLogs, settings],
    );
    const symptoms = useMemo(() => summarizeTopSymptoms(dailyLogs, 5), [dailyLogs]);
    const observedDayCount = useMemo(
        () => dailyLogs.filter((log) => (log.source ?? "observed") === "observed").length,
        [dailyLogs],
    );
    const observationAdjustmentCount = useMemo(
        () => countObservationAdjustments(settings, cycles, dailyLogs, moodCheckIns),
        [cycles, dailyLogs, moodCheckIns, settings],
    );
    const enoughData = moodCheckIns.length >= 4;
    const enoughObservedCycles = cycleSummaries.length >= 3;
    const statusIconName = enoughObservedCycles || enoughData ? "chart-line" : "timer-sand";
    const statusTitle = enoughObservedCycles
        ? "Base observada útil"
        : enoughData || observedDayCount >= 10
          ? "Base creciendo"
          : "Base inicial";
    const statusText = enoughObservedCycles
        ? `Ya hay ${cycleSummaries.length} ciclos observados para comparar duración, dolor, energía y síntomas con bastante más contexto.`
        : enoughData || observedDayCount >= 10
          ? `Ya hay ${moodCheckIns.length} momentos y ${observedDayCount} días observados. Aún falta más historia cerrada para confiar más en comparaciones por ciclo.`
          : "Todavía manda muestra corta. Rea ya puede enseñar señales sueltas, pero no conviene leerlas como patrón firme.";
    const statusDetail =
        observationAdjustmentCount > 0
            ? `${statusText} ${buildObservationAdjustmentCopy(observationAdjustmentCount)}`
            : statusText;
    const basisMetrics = useMemo(() => {
        const metrics = [
            `${moodCheckIns.length} ${moodCheckIns.length === 1 ? "momento" : "momentos"}`,
            `${observedDayCount} ${observedDayCount === 1 ? "día observado" : "días observados"}`,
            `${cycleSummaries.length} ${cycleSummaries.length === 1 ? "ciclo observado" : "ciclos observados"}`,
        ];

        if (observationAdjustmentCount > 0) {
            metrics.push(
                `${observationAdjustmentCount} ${observationAdjustmentCount === 1 ? "ajuste" : "ajustes"} por observación`,
            );
        }

        return metrics;
    }, [cycleSummaries.length, moodCheckIns.length, observationAdjustmentCount, observedDayCount]);
    const metricVariabilityEmptyText = enoughData
        ? ""
        : moodCheckIns.length === 0
          ? "Todavía no hay momentos suficientes para leer cuánto cambia ánimo, energía o dolor."
          : `Faltan ${4 - moodCheckIns.length} ${4 - moodCheckIns.length === 1 ? "momento" : "momentos"} para empezar a leer variación real entre registros.`;
    const metricVariability = useMemo(
        () =>
            METRICS.map((metric) => ({
                ...metric,
                value: getMetricSpread(moodCheckIns.map((item) => item[metric.key])),
                valueLabel: `${getMetricSpread(moodCheckIns.map((item) => item[metric.key])).toFixed(1)} pts`,
            })),
        [moodCheckIns],
    );

    return {
        alerts,
        basisMetrics,
        cycleSummaries,
        insights,
        metricVariability,
        metricVariabilityEmptyText,
        observedDayCount,
        enoughData,
        statusIconName,
        statusText: statusDetail,
        statusTitle,
        symptoms,
    };
}

function getMetricSpread(values: number[]) {
    if (values.length === 0) {
        return 0;
    }

    return Math.max(...values) - Math.min(...values);
}

function countObservationAdjustments(
    settings: AppSettings | null,
    cycles: Cycle[],
    dailyLogs: DailyLog[],
    moodCheckIns: MoodCheckIn[],
) {
    const observedDates = Array.from(
        new Set([
            ...dailyLogs.filter((log) => (log.source ?? "observed") === "observed").map((log) => log.date),
            ...moodCheckIns.map((item) => item.datetime.slice(0, 10)),
        ]),
    )
        .sort()
        .slice(-60);

    return observedDates.reduce((count, iso) => {
        const withObserved = estimateCycle(settings, cycles, dailyLogs, iso, moodCheckIns);
        const withoutObserved = estimateCycle(
            settings,
            cycles,
            dailyLogs.filter((log) => log.date !== iso),
            iso,
            moodCheckIns.filter((item) => !item.datetime.startsWith(iso)),
        );

        const adjustedByObservation =
            withObserved.phaseSource === "observed_signals" &&
            (withObserved.phase !== withoutObserved.phase ||
                withObserved.source !== withoutObserved.source ||
                withObserved.confidence !== withoutObserved.confidence);

        return count + (adjustedByObservation ? 1 : 0);
    }, 0);
}

function buildObservationAdjustmentCopy(observationAdjustmentCount: number) {
    return observationAdjustmentCount === 1
        ? "Ya hubo 1 ajuste por observación frente al calendario."
        : `Ya hubo ${observationAdjustmentCount} ajustes por observación frente al calendario.`;
}
