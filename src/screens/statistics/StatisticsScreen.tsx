import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { formatShortDate } from "@/modules/cycle/utils/cycleDate.utils";
import useStatisticsStore from "@/modules/state/useStatisticsStore";
import { colors } from "@/theme";
import { BrandMark } from "@/ui/BrandMark";
import { ScreenHeader } from "@/ui/ScreenHeader";
import { SoftCard } from "@/ui/SoftCard";
import styles from "./StatisticsScreen.styles";
import AlertCard from "./components/AlertCard";
import InsightRow from "./components/InsightRow";
import MetricBar from "./components/MetricBar";
import MetricPill from "./components/MetricPill";
import useStatisticsModel from "./hooks/useStatisticsModel";

/** Screen de estadisticas e insights observados. */
export function StatisticsScreen() {
    const { t } = useTranslation("statistics");
    const { checkInMoments, dailyRecords, periodHistory, settings } = useStatisticsStore();
    const {
        alerts,
        basisMetrics,
        cycleSummaries,
        editorialCards,
        enoughData,
        insights,
        medicationEffectiveness,
        metricVariability,
        metricVariabilityEmptyText,
        recentTrend,
        statusIconName,
        statusText,
        statusTitle,
        symptoms,
    } = useStatisticsModel({
        settings,
        periodHistory,
        checkInMoments,
        dailyRecords,
    });

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <ScreenHeader
                titleIcon={<BrandMark color={colors.primaryDeep} size={24} />}
                subtitle={t("header.subtitle")}
                title={t("header.title")}
            />

            <SoftCard style={styles.statusCard} tone="primary" variant="accent">
                <View style={styles.statusIcon}>
                    <MaterialCommunityIcons color={colors.primaryDeep} name={statusIconName as never} size={28} />
                </View>
                <View style={styles.statusBody}>
                    <Text style={styles.statusTitle}>{statusTitle}</Text>
                    <Text style={styles.statusText}>{statusText}</Text>
                    <View style={styles.statusMetrics}>
                        {basisMetrics.map((item) => (
                            <MetricPill key={item} label={item} tone="soft" />
                        ))}
                    </View>
                </View>
            </SoftCard>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("sections.variability")}</Text>
                <SoftCard style={styles.chartCard}>
                    {enoughData ? (
                        metricVariability.map((metric) => (
                            <MetricBar
                                key={metric.key}
                                color={metric.color}
                                label={metric.label}
                                maxValue={4}
                                value={metric.value}
                                valueLabel={metric.valueLabel}
                            />
                        ))
                    ) : (
                        <Text style={styles.emptyText}>{metricVariabilityEmptyText}</Text>
                    )}
                </SoftCard>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("sections.recentTrend")}</Text>
                <SoftCard style={styles.chartCard}>
                    {recentTrend.length === 0 ? (
                        <Text style={styles.emptyText}>{t("empty.recentTrend")}</Text>
                    ) : (
                        recentTrend.map((metric) => (
                            <MetricBar
                                key={metric.key}
                                color={metric.color}
                                label={metric.label}
                                maxValue={5}
                                value={metric.value}
                                valueLabel={metric.valueLabel}
                            />
                        ))
                    )}
                </SoftCard>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("sections.medications")}</Text>
                <SoftCard style={styles.chartCard}>
                    {medicationEffectiveness.length === 0 ? (
                        <Text style={styles.emptyText}>{t("empty.medications")}</Text>
                    ) : (
                        medicationEffectiveness.map((metric) => (
                            <MetricBar
                                key={metric.key}
                                color={colors.primary}
                                label={metric.label}
                                maxValue={2}
                                value={metric.value}
                                valueLabel={metric.valueLabel}
                            />
                        ))
                    )}
                </SoftCard>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("sections.insights")}</Text>
                <SoftCard style={styles.insightCard}>
                    {insights.length === 0 ? (
                        <Text style={styles.emptyText}>{t("empty.insights")}</Text>
                    ) : (
                        insights.map((insight) => <InsightRow insight={insight} key={insight.id} />)
                    )}
                </SoftCard>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("sections.alerts")}</Text>
                <View style={styles.alertList}>
                    {alerts.length === 0 ? (
                        <SoftCard variant="soft">
                            <Text style={styles.emptyText}>{t("empty.alerts")}</Text>
                        </SoftCard>
                    ) : (
                        alerts.map((alert) => <AlertCard alert={alert} key={alert.id} />)
                    )}
                </View>
            </View>

            {editorialCards.length > 0 ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{t("sections.editorial")}</Text>
                    <View style={styles.summaryList}>
                        {editorialCards.map((card) => (
                            <SoftCard key={card.id} style={styles.editorialCard} variant="soft">
                                <Text style={styles.editorialTitle}>{card.title}</Text>
                                <Text style={styles.editorialBody}>{card.body}</Text>
                                {card.source ? <Text style={styles.editorialSource}>{card.source}</Text> : null}
                            </SoftCard>
                        ))}
                    </View>
                </View>
            ) : null}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("sections.cycleSummaries")}</Text>
                <View style={styles.summaryList}>
                    {cycleSummaries.length === 0 ? (
                        <SoftCard variant="soft">
                            <Text style={styles.emptyText}>{t("cycleSummaries.empty")}</Text>
                        </SoftCard>
                    ) : (
                        cycleSummaries.map((summary) => (
                            <SoftCard key={summary.id} style={styles.summaryCard}>
                                <View style={styles.summaryHeader}>
                                    <Text style={styles.summaryTitle}>
                                        {summary.endDate
                                            ? t("cycleSummaries.range", {
                                                  end: formatShortDate(summary.endDate),
                                                  start: formatShortDate(summary.startDate),
                                              })
                                            : formatShortDate(summary.startDate)}
                                    </Text>
                                    <Text style={styles.summaryMeta}>
                                        {summary.cycleLengthDays
                                            ? t("cycleSummaries.cycleLength", { count: summary.cycleLengthDays })
                                            : t("cycleSummaries.pendingNextStart")}
                                    </Text>
                                </View>

                                <View style={styles.summaryMetrics}>
                                    <MetricPill
                                        label={t("cycleSummaries.bleedingDays", { count: summary.bleedingDays })}
                                        tone="soft"
                                    />
                                    {summary.heavyDays > 0 ? (
                                        <MetricPill
                                            label={t("cycleSummaries.heavyDays", { count: summary.heavyDays })}
                                            tone="watch"
                                        />
                                    ) : null}
                                    {summary.painImpactDays > 0 ? (
                                        <MetricPill
                                            label={t("cycleSummaries.painImpactDays", {
                                                count: summary.painImpactDays,
                                            })}
                                            tone="watch"
                                        />
                                    ) : null}
                                </View>

                                <Text style={styles.summaryFoot}>
                                    {summary.topSymptoms.length > 0
                                        ? t("cycleSummaries.topSymptoms", {
                                              symptoms: summary.topSymptoms.join(", "),
                                          })
                                        : t("cycleSummaries.topSymptomsEmpty")}
                                </Text>
                            </SoftCard>
                        ))
                    )}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t("sections.symptoms")}</Text>
                <SoftCard style={styles.symptomCard}>
                    {symptoms.length === 0 ? (
                        <Text style={styles.emptyText}>{t("empty.symptoms")}</Text>
                    ) : (
                        symptoms.map((item) => (
                            <View key={item.label} style={styles.symptomRow}>
                                <Text style={styles.symptomLabel}>{item.label}</Text>
                                <Text style={styles.symptomCount}>{item.count}</Text>
                            </View>
                        ))
                    )}
                </SoftCard>
            </View>
        </ScrollView>
    );
}
