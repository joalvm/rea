import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DimensionValue, ScrollView, StyleSheet, Text, View } from "react-native";

import { SoftCard } from "../components/SoftCard";
import { average, buildPersonalInsights } from "../cycle";
import { colors, radii, type } from "../theme";
import { DailyLog, MoodCheckIn } from "../types";

interface PatternsScreenProps {
  moodCheckIns: MoodCheckIn[];
  dailyLogs: DailyLog[];
}

const METRICS: Array<{ key: keyof Pick<MoodCheckIn, "mood" | "energy" | "pain" | "stress">; label: string; color: string }> = [
  { key: "mood", label: "Ánimo", color: colors.primary },
  { key: "energy", label: "Energía", color: colors.fertile },
  { key: "pain", label: "Dolor", color: colors.period },
  { key: "stress", label: "Estrés", color: colors.luteal }
];

export function PatternsScreen({ moodCheckIns, dailyLogs }: PatternsScreenProps) {
  const insights = buildPersonalInsights(moodCheckIns, dailyLogs);
  const enoughData = moodCheckIns.length >= 4;

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Patrones propios</Text>
        <Text style={styles.title}>Lo que Mensu puede observar.</Text>
        <Text style={styles.subtitle}>
          Las conclusiones usan tus registros. No afirman causa hormonal ni reemplazan criterio médico.
        </Text>
      </View>

      <SoftCard style={styles.statusCard}>
        <View style={styles.statusIcon}>
          <MaterialCommunityIcons color={colors.primaryDeep} name={enoughData ? "chart-line" : "timer-sand"} size={28} />
        </View>
        <View style={styles.statusBody}>
          <Text style={styles.statusTitle}>{enoughData ? "Historial inicial listo" : "Aún juntando señales"}</Text>
          <Text style={styles.statusText}>
            {enoughData
              ? "Ya hay suficientes check-ins para mostrar tendencias suaves."
              : "Con 4 check-ins aparecen los primeros patrones. Con 3 ciclos serán más útiles."}
          </Text>
        </View>
      </SoftCard>

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
        <Text style={styles.sectionTitle}>Insights</Text>
        <SoftCard style={styles.insightCard}>
          {insights.map((insight) => (
            <View key={insight} style={styles.insightRow}>
              <MaterialCommunityIcons color={colors.primaryDeep} name="star-four-points-outline" size={19} />
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </SoftCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Síntomas más registrados</Text>
        <SoftCard style={styles.symptomCard}>
          {topSymptoms(dailyLogs).length === 0 ? (
            <Text style={styles.emptyText}>Aún no hay síntomas suficientes para ordenar tendencias.</Text>
          ) : (
            topSymptoms(dailyLogs).map((item) => (
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

function topSymptoms(logs: DailyLog[]) {
  const counts = new Map<string, number>();
  logs.forEach((log) => {
    log.symptoms.forEach((symptom) => counts.set(symptom, (counts.get(symptom) ?? 0) + 1));
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    paddingTop: 58,
    paddingHorizontal: 18,
    paddingBottom: 32,
    gap: 22
  },
  header: {
    gap: 8
  },
  kicker: {
    color: colors.primaryDeep,
    fontSize: type.small,
    fontWeight: "900"
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.muted,
    fontSize: type.body,
    lineHeight: 22
  },
  statusCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: colors.primarySoft
  },
  statusIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  statusBody: {
    flex: 1,
    gap: 5
  },
  statusTitle: {
    color: colors.ink,
    fontSize: type.subtitle,
    fontWeight: "900"
  },
  statusText: {
    color: colors.primaryInk,
    fontSize: type.body,
    lineHeight: 22,
    fontWeight: "700"
  },
  section: {
    gap: 12
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: type.subtitle,
    fontWeight: "900"
  },
  chartCard: {
    gap: 18
  },
  barRow: {
    gap: 8
  },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  barLabel: {
    color: colors.ink,
    fontSize: type.body,
    fontWeight: "900"
  },
  barValue: {
    color: colors.muted,
    fontSize: type.small,
    fontWeight: "800"
  },
  barTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surfaceSoft,
    overflow: "hidden"
  },
  barFill: {
    height: 12,
    borderRadius: 6
  },
  insightCard: {
    gap: 14
  },
  insightRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start"
  },
  insightText: {
    flex: 1,
    color: colors.ink,
    fontSize: type.body,
    lineHeight: 22
  },
  symptomCard: {
    gap: 10
  },
  symptomRow: {
    minHeight: 46,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  symptomLabel: {
    color: colors.ink,
    fontSize: type.body,
    fontWeight: "800"
  },
  symptomCount: {
    color: colors.primaryDeep,
    fontSize: type.body,
    fontWeight: "900"
  },
  emptyText: {
    color: colors.muted,
    fontSize: type.body,
    lineHeight: 22
  }
});
