import { useMemo } from "react";

import buildEducationalAlerts from "@/modules/cycle/alerts/buildEducationalAlerts";
import buildPatternInsights from "@/modules/cycle/insights/buildPatternInsights";
import { average } from "@/modules/cycle/shared/cycleMath.utils";
import { summarizeTopSymptoms } from "@/modules/cycle/shared/cycleSummary.utils";
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
    const enoughData = moodCheckIns.length >= 4;
    const enoughObservedCycles = cycleSummaries.length >= 3;
    const statusIconName = enoughData ? "chart-line" : "timer-sand";
    const statusTitle = enoughObservedCycles
        ? "Ya hay base útil"
        : enoughData
          ? "Historial inicial listo"
          : "Aún juntando señales";
    const statusText = enoughObservedCycles
        ? `Ya hay ${cycleSummaries.length} ciclos observados para comparar duración, dolor y síntomas repetidos.`
        : enoughData
          ? "Ya hay suficientes momentos para enseñar tendencias, pero con 3 ciclos observados ganan contexto."
          : "Con 4 momentos aparecen los primeros patrones. Con 3 ciclos observados serán más defendibles.";
    const metricAverages = useMemo(
        () =>
            METRICS.map((metric) => ({
                ...metric,
                value: average(moodCheckIns.map((item) => item[metric.key])),
            })),
        [moodCheckIns],
    );

    return {
        alerts,
        cycleSummaries,
        insights,
        metricAverages,
        statusIconName,
        statusText,
        statusTitle,
        symptoms,
    };
}
