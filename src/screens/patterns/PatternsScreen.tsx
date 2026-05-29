import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DimensionValue, Image, ScrollView, StyleSheet, Text, View } from "react-native";

import buildEducationalAlerts from "../../modules/cycle/alerts/buildEducationalAlerts";
import buildPatternInsights from "../../modules/cycle/insights/buildPatternInsights";
import buildCycleSummaries from "../../modules/cycle/summaries/buildCycleSummaries";
import { formatShortDate } from "../../modules/cycle/shared/cycleDate.utils";
import { average } from "../../modules/cycle/shared/cycleMath.utils";
import { summarizeTopSymptoms } from "../../modules/cycle/shared/cycleSummary.utils";
import { colors, radii, type } from "../../theme";
import { EducationalAlert, PatternInsight } from "../../types/insights.types";
import { MoodCheckIn } from "../../types/records.types";
import { SoftCard } from "../../ui/SoftCard";
import { PatternsScreenProps } from "./patterns.types";

const brandVertical = require("../../../assets/branding/logo-vertical.png");

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

export function PatternsScreen({ settings, cycles, moodCheckIns, dailyLogs }: PatternsScreenProps) {
    const insights = buildPatternInsights(settings, cycles, dailyLogs, moodCheckIns);
    const alerts = buildEducationalAlerts(settings, cycles, dailyLogs, moodCheckIns);
    const cycleSummaries = buildCycleSummaries(settings, cycles, dailyLogs, 6);
    const symptoms = summarizeTopSymptoms(dailyLogs, 5);
    const enoughData = moodCheckIns.length >= 4;
    const enoughObservedCycles = cycleSummaries.length >= 3;

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Image resizeMode="contain" source={brandVertical} style={styles.brandImage} />
                <Text style={styles.kicker}>Patrones propios</Text>
                <Text style={styles.title}>Cuaderno de señales.</Text>
                <Text style={styles.subtitle}>
                    Lectura tranquila de dolor, energía, síntomas y cambios entre ciclos. Observa repeticiones, no
                    certezas.
                </Text>
            </View>

            <SoftCard style={styles.statusCard}>
                <View style={styles.statusIcon}>
                    <MaterialCommunityIcons
                        color={colors.primaryDeep}
                        name={enoughData ? "chart-line" : "timer-sand"}
                        size={28}
                    />
                </View>
                <View style={styles.statusBody}>
                    <Text style={styles.statusTitle}>
                        {enoughObservedCycles
                            ? "Ya hay base útil"
                            : enoughData
                              ? "Historial inicial listo"
                              : "Aún juntando señales"}
                    </Text>
                    <Text style={styles.statusText}>
                        {enoughObservedCycles
                            ? `Ya hay ${cycleSummaries.length} ciclos observados para comparar duración, dolor y síntomas repetidos.`
                            : enoughData
                              ? "Ya hay suficientes momentos para enseñar tendencias, pero con 3 ciclos observados ganan contexto."
                              : "Con 4 momentos aparecen los primeros patrones. Con 3 ciclos observados serán más defendibles."}
                    </Text>
                </View>
            </SoftCard>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Lo que sí se repite</Text>
                <SoftCard style={styles.insightCard}>
                    {insights.length === 0 ? (
                        <Text style={styles.emptyText}>
                            Aún faltan datos para detectar repeticiones sólidas por fase o intensidad.
                        </Text>
                    ) : (
                        insights.map((insight) => <InsightRow insight={insight} key={insight.id} />)
                    )}
                </SoftCard>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Señales educativas para vigilar</Text>
                <View style={styles.alertList}>
                    {alerts.length === 0 ? (
                        <SoftCard>
                            <Text style={styles.emptyText}>
                                No aparece una señal llamativa en tus registros actuales. Eso no equivale a descarte
                                médico.
                            </Text>
                        </SoftCard>
                    ) : (
                        alerts.map((alert) => <AlertCard alert={alert} key={alert.id} />)
                    )}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tus últimos ciclos observados</Text>
                <View style={styles.summaryList}>
                    {cycleSummaries.length === 0 ? (
                        <SoftCard>
                            <Text style={styles.emptyText}>
                                Cuando marques inicios y finales reales del periodo, aquí aparecerá la comparación entre
                                ciclos.
                            </Text>
                        </SoftCard>
                    ) : (
                        cycleSummaries.map((summary) => (
                            <SoftCard key={summary.id} style={styles.summaryCard}>
                                <View style={styles.summaryHeader}>
                                    <Text style={styles.summaryTitle}>
                                        {formatShortDate(summary.startDate)}
                                        {summary.endDate ? ` al ${formatShortDate(summary.endDate)}` : ""}
                                    </Text>
                                    <Text style={styles.summaryMeta}>
                                        {summary.cycleLengthDays
                                            ? `${summary.cycleLengthDays} días de ciclo`
                                            : "Esperando siguiente inicio"}
                                    </Text>
                                </View>

                                <View style={styles.summaryMetrics}>
                                    <MetricPill label={`${summary.bleedingDays} días de sangrado`} tone="soft" />
                                    {summary.heavyDays > 0 ? (
                                        <MetricPill label={`${summary.heavyDays} días abundantes`} tone="watch" />
                                    ) : null}
                                    {summary.painImpactDays > 0 ? (
                                        <MetricPill
                                            label={`${summary.painImpactDays} días con dolor que frenó`}
                                            tone="watch"
                                        />
                                    ) : null}
                                </View>

                                <Text style={styles.summaryFoot}>
                                    {summary.topSymptoms.length > 0
                                        ? `Síntomas que destacaron: ${summary.topSymptoms.join(", ")}.`
                                        : "Sin síntomas repetidos destacados en ese ciclo."}
                                </Text>
                            </SoftCard>
                        ))
                    )}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Promedios recientes</Text>
                <SoftCard style={styles.chartCard}>
                    {METRICS.map((metric) => {
                        const value = average(moodCheckIns.map((item) => item[metric.key]));
                        return <Bar key={metric.key} color={metric.color} label={metric.label} value={value} />;
                    })}
                </SoftCard>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Síntomas más registrados</Text>
                <SoftCard style={styles.symptomCard}>
                    {symptoms.length === 0 ? (
                        <Text style={styles.emptyText}>Aún no hay síntomas suficientes para ordenar tendencias.</Text>
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

function InsightRow({ insight }: { insight: PatternInsight }) {
    return (
        <View style={styles.insightRow}>
            <View style={[styles.insightIcon, insight.tone === "watch" && styles.insightIconWatch]}>
                <MaterialCommunityIcons
                    color={insight.tone === "watch" ? colors.period : colors.primaryDeep}
                    name={insight.tone === "watch" ? "bell-alert-outline" : "star-four-points-outline"}
                    size={18}
                />
            </View>
            <View style={styles.insightCopy}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightText}>{insight.detail}</Text>
            </View>
        </View>
    );
}

function AlertCard({ alert }: { alert: EducationalAlert }) {
    const tone = getAlertTone(alert.severity);

    return (
        <SoftCard style={styles.alertCard}>
            <View style={styles.alertHeader}>
                <View style={[styles.alertBadge, { backgroundColor: tone.background }]}>
                    <Text style={[styles.alertBadgeText, { color: tone.ink }]}>{tone.label}</Text>
                </View>
                <MaterialCommunityIcons color={tone.ink} name={tone.icon as never} size={18} />
            </View>
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertText}>{alert.detail}</Text>
        </SoftCard>
    );
}

function MetricPill({ label, tone }: { label: string; tone: "soft" | "watch" }) {
    return (
        <View style={[styles.metricPill, tone === "watch" && styles.metricPillWatch]}>
            <Text style={[styles.metricPillText, tone === "watch" && styles.metricPillTextWatch]}>{label}</Text>
        </View>
    );
}

function getAlertTone(severity: EducationalAlert["severity"]) {
    if (severity === "consult") {
        return {
            label: "Consultar",
            background: colors.periodSoft,
            ink: colors.period,
            icon: "stethoscope",
        };
    }

    if (severity === "watch") {
        return {
            label: "Vigilar",
            background: colors.primarySoft,
            ink: colors.primaryDeep,
            icon: "eye-outline",
        };
    }

    return {
        label: "Info",
        background: colors.surfaceSoft,
        ink: colors.muted,
        icon: "information-outline",
    };
}

function Bar({ label, value, color }: { label: string; value: number; color: string }) {
    const width = `${Math.min(100, Math.max(4, (value / 5) * 100))}%` as DimensionValue;
    return (
        <View style={styles.barRow}>
            <View style={styles.barHeader}>
                <Text style={styles.barLabel}>{label}</Text>
                <Text style={styles.barValue}>{value ? value.toFixed(1) : "0.0"}/5</Text>
            </View>
            <View style={styles.barTrack}>
                <View style={[styles.barFill, { width, backgroundColor: color }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    content: {
        backgroundColor: colors.background,
        paddingTop: 58,
        paddingHorizontal: 18,
        paddingBottom: 32,
        gap: 22,
    },
    header: {
        gap: 10,
    },
    brandImage: {
        width: 118,
        height: 152,
        marginBottom: 4,
    },
    kicker: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
        textTransform: "uppercase",
    },
    title: {
        color: colors.ink,
        fontSize: 30,
        lineHeight: 36,
        fontWeight: "900",
    },
    subtitle: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
    statusCard: {
        flexDirection: "row",
        gap: 14,
    },
    statusIcon: {
        width: 50,
        height: 50,
        borderRadius: radii.md,
        backgroundColor: colors.surfaceSoft,
        borderWidth: 1,
        borderColor: colors.line,
        alignItems: "center",
        justifyContent: "center",
    },
    statusBody: {
        flex: 1,
        gap: 5,
    },
    statusTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    statusText: {
        color: colors.primaryInk,
        fontSize: type.body,
        lineHeight: 22,
        fontWeight: "700",
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    chartCard: {
        gap: 18,
    },
    alertList: {
        gap: 12,
    },
    alertCard: {
        gap: 10,
    },
    alertHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    alertBadge: {
        minHeight: 28,
        paddingHorizontal: 10,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    alertBadgeText: {
        fontSize: type.small,
        fontWeight: "900",
    },
    alertTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    alertText: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
    barRow: {
        gap: 8,
    },
    barHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    barLabel: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    barValue: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "800",
    },
    barTrack: {
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.surfaceSoft,
        overflow: "hidden",
    },
    barFill: {
        height: 12,
        borderRadius: 6,
    },
    insightCard: {
        gap: 14,
    },
    insightRow: {
        flexDirection: "row",
        gap: 10,
        alignItems: "flex-start",
    },
    insightIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: colors.primarySoft,
        alignItems: "center",
        justifyContent: "center",
    },
    insightIconWatch: {
        backgroundColor: colors.periodSoft,
    },
    insightCopy: {
        flex: 1,
        gap: 4,
    },
    insightTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    insightText: {
        flex: 1,
        color: colors.ink,
        fontSize: type.body,
        lineHeight: 22,
    },
    summaryList: {
        gap: 12,
    },
    summaryCard: {
        gap: 12,
    },
    summaryHeader: {
        gap: 4,
    },
    summaryTitle: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
    },
    summaryMeta: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "800",
    },
    summaryMetrics: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    metricPill: {
        minHeight: 32,
        borderRadius: 16,
        backgroundColor: colors.surfaceSoft,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    metricPillWatch: {
        backgroundColor: colors.periodSoft,
    },
    metricPillText: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
    },
    metricPillTextWatch: {
        color: colors.period,
    },
    summaryFoot: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
    symptomCard: {
        gap: 10,
    },
    symptomRow: {
        minHeight: 46,
        borderRadius: radii.md,
        backgroundColor: colors.surfaceSoft,
        paddingHorizontal: 14,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    symptomLabel: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "800",
    },
    symptomCount: {
        color: colors.primaryDeep,
        fontSize: type.body,
        fontWeight: "900",
    },
    emptyText: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
});
