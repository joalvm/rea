import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, ScrollView, Text, View } from "react-native";

import logoHorizontal from "@assets/branding/logo-horizontal.png";
import buildEducationalAlerts from "@/modules/cycle/alerts/buildEducationalAlerts";
import buildPatternInsights from "@/modules/cycle/insights/buildPatternInsights";
import buildCycleSummaries from "@/modules/cycle/summaries/buildCycleSummaries";
import { formatShortDate } from "@/modules/cycle/shared/cycleDate.utils";
import { average } from "@/modules/cycle/shared/cycleMath.utils";
import { summarizeTopSymptoms } from "@/modules/cycle/shared/cycleSummary.utils";
import { colors } from "@/theme";
import { Cycle } from "@/types/cycle.types";
import { DailyLog, MoodCheckIn } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";
import { SoftCard } from "@/ui/SoftCard";
import styles from "./PatternsScreen.styles";
import AlertCard from "./components/AlertCard";
import InsightRow from "./components/InsightRow";
import MetricBar from "./components/MetricBar";
import MetricPill from "./components/MetricPill";

/** Props del screen de patrones e insights. */
interface PatternsScreenProps {
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
                <Image resizeMode="contain" source={logoHorizontal} style={styles.brandImage} />
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
                        return <MetricBar key={metric.key} color={metric.color} label={metric.label} value={value} />;
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
