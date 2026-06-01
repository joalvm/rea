import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, Text, View } from "react-native";

import { formatShortDate } from "@/modules/cycle/utils/cycleDate.utils";
import { colors } from "@/theme";
import { Cycle } from "@/types/cycle.types";
import { DailyLog, MoodCheckIn } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";
import { BrandMark } from "@/ui/BrandMark";
import { ScreenHeader } from "@/ui/ScreenHeader";
import { SoftCard } from "@/ui/SoftCard";
import styles from "./PatternsScreen.styles";
import AlertCard from "./components/AlertCard";
import InsightRow from "./components/InsightRow";
import MetricBar from "./components/MetricBar";
import MetricPill from "./components/MetricPill";
import usePatternsModel from "./hooks/usePatternsModel";

/** Props del screen de patrones e insights. */
interface PatternsScreenProps {
    settings: AppSettings | null;
    cycles: Cycle[];
    moodCheckIns: MoodCheckIn[];
    dailyLogs: DailyLog[];
}

export function PatternsScreen({ settings, cycles, moodCheckIns, dailyLogs }: PatternsScreenProps) {
    const { alerts, cycleSummaries, insights, metricAverages, statusIconName, statusText, statusTitle, symptoms } =
        usePatternsModel({
            settings,
            cycles,
            moodCheckIns,
            dailyLogs,
        });

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <ScreenHeader
                titleIcon={<BrandMark color={colors.primaryDeep} size={20} />}
                subtitle="Lectura tranquila de dolor, energía, síntomas y cambios entre ciclos. Observa repeticiones, no certezas."
                title="Patrones"
            />

            <SoftCard style={styles.statusCard} tone="primary" variant="accent">
                <View style={styles.statusIcon}>
                    <MaterialCommunityIcons color={colors.primaryDeep} name={statusIconName as never} size={28} />
                </View>
                <View style={styles.statusBody}>
                    <Text style={styles.statusTitle}>{statusTitle}</Text>
                    <Text style={styles.statusText}>{statusText}</Text>
                </View>
            </SoftCard>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Promedios recientes</Text>
                <SoftCard style={styles.chartCard}>
                    {metricAverages.map((metric) => (
                        <MetricBar key={metric.key} color={metric.color} label={metric.label} value={metric.value} />
                    ))}
                </SoftCard>
            </View>

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
                        <SoftCard variant="soft">
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
                        <SoftCard variant="soft">
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
