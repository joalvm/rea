import { useMemo } from "react";
import { useTranslation } from "react-i18next";

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
    labelKey: string;
    color: string;
}[] = [
    { key: "mood", labelKey: "metrics.mood", color: colors.primary },
    { key: "energy", labelKey: "metrics.energy", color: colors.fertile },
    { key: "pain", labelKey: "metrics.pain", color: colors.period },
    { key: "stress", labelKey: "metrics.stress", color: colors.luteal },
];

/** Junta derivados, métricas y copy de estado que alimentan la pantalla de patrones. */
export default function usePatternsModel({ settings, cycles, moodCheckIns, dailyLogs }: UsePatternsModelParams) {
    const { t } = useTranslation("patterns");
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
        ? t("status.observedUseful")
        : enoughData || observedDayCount >= 10
          ? t("status.growing")
          : t("status.initial");
    const statusText = enoughObservedCycles
        ? t("status.observedUsefulText", { count: cycleSummaries.length })
        : enoughData || observedDayCount >= 10
          ? t("status.growingText", { days: observedDayCount, moments: moodCheckIns.length })
          : t("status.initialText");
    const statusDetail =
        observationAdjustmentCount > 0
            ? `${statusText} ${t("status.observationAdjustment", { count: observationAdjustmentCount })}`
            : statusText;
    const basisMetrics = useMemo(() => {
        const metrics = [
            t("basis.moment", { count: moodCheckIns.length }),
            t("basis.day", { count: observedDayCount }),
            t("basis.cycle", { count: cycleSummaries.length }),
        ];

        if (observationAdjustmentCount > 0) {
            metrics.push(t("basis.adjustment", { count: observationAdjustmentCount }));
        }

        return metrics;
    }, [cycleSummaries.length, moodCheckIns.length, observationAdjustmentCount, observedDayCount, t]);
    const metricVariabilityEmptyText = enoughData
        ? ""
        : moodCheckIns.length === 0
          ? t("empty.metricNoMoments")
          : t("empty.metricPending", { count: 4 - moodCheckIns.length });
    const metricVariability = useMemo(
        () =>
            METRICS.map((metric) => ({
                color: metric.color,
                key: metric.key,
                label: t(metric.labelKey),
                value: getMetricSpread(moodCheckIns.map((item) => item[metric.key])),
                valueLabel: t("metrics.points", {
                    value: getMetricSpread(moodCheckIns.map((item) => item[metric.key])).toFixed(1),
                }),
            })),
        [moodCheckIns, t],
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
