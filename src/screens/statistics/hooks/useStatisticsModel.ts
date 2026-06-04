import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import buildEducationalAlerts from "@/modules/cycle/alerts/buildEducationalAlerts";
import estimateCycle from "@/modules/cycle/estimation/estimateCycle";
import buildObservedInsights from "@/modules/cycle/insights/buildObservedInsights";
import { toIsoDate } from "@/modules/cycle/utils/cycleDate.utils";
import { summarizeTopSymptoms } from "@/modules/cycle/utils/cycleSummary.utils";
import buildCycleSummaries from "@/modules/cycle/summaries/buildCycleSummaries";
import { selectedLanguage } from "@/modules/localization/currentLocale";
import useContentStore from "@/modules/state/useContentStore";
import { colors } from "@/theme";
import { Cycle } from "@/types/cycle.types";
import { DailyLog, MedicationRelief, MoodCheckIn } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";

interface UseStatisticsModelParams {
    settings: AppSettings | null;
    periodHistory: Cycle[];
    checkInMoments: MoodCheckIn[];
    dailyRecords: DailyLog[];
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

/** Junta derivados, métricas y copy de estado que alimentan la pantalla de estadisticas. */
export default function useStatisticsModel({
    settings,
    periodHistory,
    checkInMoments,
    dailyRecords,
}: UseStatisticsModelParams) {
    const { t } = useTranslation(["statistics", "content", "contentSources"]);
    const loadStatisticsCards = useContentStore((state) => state.loadStatisticsCards);
    const statisticsCards = useContentStore((state) => state.statisticsCards);
    const insights = useMemo(
        () => buildObservedInsights(settings, periodHistory, dailyRecords, checkInMoments),
        [checkInMoments, dailyRecords, periodHistory, settings],
    );
    const alerts = useMemo(
        () => buildEducationalAlerts(settings, periodHistory, dailyRecords, checkInMoments),
        [checkInMoments, dailyRecords, periodHistory, settings],
    );
    const cycleSummaries = useMemo(
        () => buildCycleSummaries(settings, periodHistory, dailyRecords, 6),
        [dailyRecords, periodHistory, settings],
    );
    const symptoms = useMemo(() => summarizeTopSymptoms(dailyRecords, 5), [dailyRecords]);
    const currentSnapshot = useMemo(
        () => estimateCycle(settings, periodHistory, dailyRecords, undefined, checkInMoments),
        [checkInMoments, dailyRecords, periodHistory, settings],
    );
    const contentContext = useMemo(
        () => ({
            surface: "statistics" as const,
            locale: selectedLanguage,
            phase: mapPhaseToContentPhase(currentSnapshot.phase),
            phaseConfidence: currentSnapshot.confidence,
            symptomKeys: Array.from(new Set(dailyRecords.flatMap((record) => record.symptoms))),
            metrics: {
                bleeding_intensity: getMaxBleedingIntensity(dailyRecords),
                energy_level: averageNumber(checkInMoments.map((entry) => entry.energy)),
                pain_intensity: maxNumber(checkInMoments.map((entry) => entry.pain)),
                stress_level: maxNumber(checkInMoments.map((entry) => entry.stress)),
            },
            tryingToConceive: settings?.tryingToConceive ?? false,
            hormonalContraception: settings?.hormonalContraception ?? false,
            limit: 2,
        }),
        [checkInMoments, currentSnapshot.confidence, currentSnapshot.phase, dailyRecords, settings],
    );

    useEffect(() => {
        void loadStatisticsCards(contentContext);
    }, [contentContext, loadStatisticsCards]);

    const editorialCards = useMemo(
        () =>
            statisticsCards.map((card) => ({
                body: t(card.bodyKey),
                id: card.id,
                source:
                    card.sourceLabelKey && card.sourceReferenceKey
                        ? t("editorial.source", {
                              label: t(card.sourceLabelKey),
                              reference: t(card.sourceReferenceKey),
                          })
                        : null,
                title: t(card.titleKey),
            })),
        [statisticsCards, t],
    );
    const observedDayCount = useMemo(
        () => dailyRecords.filter((log) => (log.source ?? "observed") === "observed").length,
        [dailyRecords],
    );
    const observationAdjustmentCount = useMemo(
        () => countObservationAdjustments(settings, periodHistory, dailyRecords, checkInMoments),
        [checkInMoments, dailyRecords, periodHistory, settings],
    );
    const enoughData = checkInMoments.length >= 4;
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
          ? t("status.growingText", { days: observedDayCount, moments: checkInMoments.length })
          : t("status.initialText");
    const statusDetail =
        observationAdjustmentCount > 0
            ? `${statusText} ${t("status.observationAdjustment", { count: observationAdjustmentCount })}`
            : statusText;
    const basisMetrics = useMemo(() => {
        const metrics = [
            t("basis.moment", { count: checkInMoments.length }),
            t("basis.day", { count: observedDayCount }),
            t("basis.cycle", { count: cycleSummaries.length }),
        ];

        if (observationAdjustmentCount > 0) {
            metrics.push(t("basis.adjustment", { count: observationAdjustmentCount }));
        }

        return metrics;
    }, [checkInMoments.length, cycleSummaries.length, observationAdjustmentCount, observedDayCount, t]);
    const metricVariabilityEmptyText = enoughData
        ? ""
        : checkInMoments.length === 0
          ? t("empty.metricNoMoments")
          : t("empty.metricPending", { count: 4 - checkInMoments.length });
    const metricVariability = useMemo(
        () =>
            METRICS.map((metric) => ({
                color: metric.color,
                key: metric.key,
                label: t(metric.labelKey),
                value: getMetricSpread(checkInMoments.map((item) => item[metric.key])),
                valueLabel: t("metrics.points", {
                    value: getMetricSpread(checkInMoments.map((item) => item[metric.key])).toFixed(1),
                }),
            })),
        [checkInMoments, t],
    );
    const recentTrend = useMemo(() => buildRecentTrend(checkInMoments, t), [checkInMoments, t]);
    const medicationEffectiveness = useMemo(() => buildMedicationEffectiveness(dailyRecords, t), [dailyRecords, t]);

    return {
        alerts,
        basisMetrics,
        cycleSummaries,
        editorialCards,
        insights,
        medicationEffectiveness,
        metricVariability,
        metricVariabilityEmptyText,
        observedDayCount,
        enoughData,
        recentTrend,
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

function buildRecentTrend(checkInMoments: MoodCheckIn[], t: ReturnType<typeof useTranslation>["t"]) {
    return checkInMoments
        .slice(0, 6)
        .reverse()
        .map((entry) => ({
            color: colors.period,
            key: String(entry.id ?? entry.datetime),
            label: toIsoDate(new Date(entry.datetime)).slice(5),
            value: entry.pain,
            valueLabel: t("metrics.score", { value: entry.pain }),
        }));
}

function buildMedicationEffectiveness(dailyRecords: DailyLog[], t: ReturnType<typeof useTranslation>["t"]) {
    const reliefByMedication = dailyRecords.reduce<Map<string, number[]>>((accumulator, record) => {
        const name = record.details?.medicationName?.trim();
        const relief = mapReliefScore(record.details?.medicationRelief);
        if (!name || relief === null) {
            return accumulator;
        }

        const current = accumulator.get(name) ?? [];
        current.push(relief);
        accumulator.set(name, current);

        return accumulator;
    }, new Map());

    return Array.from(reliefByMedication.entries())
        .map(([name, values]) => {
            const averageRelief = averageNumber(values);

            return {
                key: name,
                label: name,
                value: averageRelief,
                valueLabel: t("medications.reliefScore", {
                    count: values.length,
                    value: averageRelief.toFixed(1),
                }),
            };
        })
        .sort((left, right) => right.value - left.value)
        .slice(0, 4);
}

function mapReliefScore(value: MedicationRelief | undefined) {
    if (value === "helped") {
        return 2;
    }

    if (value === "partly_helped") {
        return 1;
    }

    if (value === "did_not_help") {
        return 0;
    }

    return null;
}

function averageNumber(values: number[]) {
    if (values.length === 0) {
        return 0;
    }

    return values.reduce((total, value) => total + value, 0) / values.length;
}

function maxNumber(values: number[]) {
    if (values.length === 0) {
        return 0;
    }

    return Math.max(...values);
}

function getMaxBleedingIntensity(records: DailyLog[]) {
    return maxNumber(records.map((record) => getBleedingIntensity(record.bleedingLevel)));
}

function getBleedingIntensity(value: DailyLog["bleedingLevel"]) {
    if (value === "heavy") {
        return 4;
    }

    if (value === "medium") {
        return 3;
    }

    if (value === "light") {
        return 2;
    }

    if (value === "spotting") {
        return 1;
    }

    return 0;
}

function mapPhaseToContentPhase(phase: string) {
    if (phase === "fertile") {
        return "fertile_window";
    }

    return phase;
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
