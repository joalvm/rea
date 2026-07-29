import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";

import { computeCycleStats } from "@/domain/stats/computeCycleStats";
import { useStatisticsData } from "@/domain/hooks/useStatisticsData";

import { StatisticsMetricCard } from "./StatisticsMetricCard";
import { getStatisticsBarHeight, getStatisticsGateText } from "./statisticsPresentation";
import { useStatisticsStyles } from "./StatisticsStyle";

export default function StatisticsScreen() {
    const { t } = useTranslation("statistics");
    const styles = useStatisticsStyles();
    const data = useStatisticsData();
    const stats = computeCycleStats(data);

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>{t("title")}</Text>
                <Text style={styles.description}>{t("description")}</Text>
            </View>

            <View style={styles.insightCard}>
                <Text style={styles.cardTitle}>{t("insights")}</Text>
                <Text style={styles.cardText}>
                    {stats.averageCycleLength === null
                        ? t("recordMore")
                        : `${t("cycleLength")}: ${Math.round(stats.averageCycleLength)} ${t("days")}.`}
                </Text>
            </View>

            <StatisticsMetricCard
                title={t("cycleLength")}
                value={stats.averageCycleLength === null ? "—" : `${Math.round(stats.averageCycleLength)} ${t("days")}`}
                footer={getStatisticsGateText(stats.validCycleCount, stats.missingCyclesForHistory, t)}
            />
            <StatisticsMetricCard
                title={t("periodLength")}
                value={
                    stats.averagePeriodLength === null ? "—" : `${Math.round(stats.averagePeriodLength)} ${t("days")}`
                }
                footer={getStatisticsGateText(stats.validCycleCount, stats.missingCyclesForHistory, t)}
            />
            <StatisticsMetricCard
                title={t("accuracy")}
                value={stats.accuracy === null ? "—" : `${stats.accuracy.meanAbsoluteError.toFixed(1)} ${t("days")}`}
                footer={
                    stats.accuracy === null
                        ? getStatisticsGateText(stats.validCycleCount, Math.max(0, 3 - stats.validCycleCount), t)
                        : `${stats.accuracy.sampleSize} ${t("cycles")} · ${t("accuracyBody")}`
                }
            />
            <StatisticsMetricCard
                title={t("checkins")}
                value={String(stats.checkinCount)}
                footer={stats.checkinCount === 0 ? t("noData") : t("recordMore")}
            />

            <View style={styles.seriesCard}>
                <Text style={styles.cardTitle}>{t("series")}</Text>
                {stats.series.length === 0 ? (
                    <Text style={styles.cardText}>{t("noData")}</Text>
                ) : (
                    <View style={styles.series}>
                        {stats.series.slice(0, 14).map((point) => (
                            <View
                                key={point.cycleDay}
                                style={styles.seriesColumn}
                                accessibilityLabel={t("seriesDay", { day: point.cycleDay })}
                            >
                                <View style={styles.seriesBars}>
                                    <View
                                        style={[
                                            styles.bar,
                                            styles.moodBar,
                                            { height: getStatisticsBarHeight(point.mood) },
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.bar,
                                            styles.energyBar,
                                            { height: getStatisticsBarHeight(point.energy) },
                                        ]}
                                    />
                                    <View
                                        style={[
                                            styles.bar,
                                            styles.painBar,
                                            { height: getStatisticsBarHeight(point.pain) },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.seriesLabel}>{point.cycleDay}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </ScrollView>
    );
}
