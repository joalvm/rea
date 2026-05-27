import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { SoftButton } from "../components/SoftButton";
import { SoftCard } from "../components/SoftCard";
import { formatShortDate } from "../cycle";
import { colors, radii, type } from "../theme";
import { DailyLog, MoodCheckIn } from "../types";

interface DiaryScreenProps {
  dailyLogs: DailyLog[];
  moodCheckIns: MoodCheckIn[];
  onOpenCheckIn: () => void;
  onOpenQuickCheckIn: () => void;
}

export function DiaryScreen({ dailyLogs, moodCheckIns, onOpenCheckIn, onOpenQuickCheckIn }: DiaryScreenProps) {
  const latest = moodCheckIns.slice(0, 12);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Diario privado</Text>
        <Text style={styles.title}>Tus registros, sin ruido.</Text>
        <Text style={styles.subtitle}>Los check-ins de mañana, noche y momentos personalizados se guardan separados.</Text>
      </View>

      <View style={styles.actions}>
        <SoftButton label="Registro completo" onPress={onOpenCheckIn} style={styles.actionButton} />
        <SoftButton label="Check-in corto" onPress={onOpenQuickCheckIn} style={styles.actionButton} variant="secondary" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Últimos check-ins</Text>
        {latest.length === 0 ? (
          <EmptyState />
        ) : (
          latest.map((item) => <CheckInRow item={item} key={item.id ?? item.datetime} />)
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Días con registro completo</Text>
        {dailyLogs.length === 0 ? (
          <EmptyState label="Aún no hay registros completos. El primero tarda menos de un minuto." />
        ) : (
          dailyLogs.map((log) => <DailyLogRow key={log.date} log={log} />)
        )}
      </View>
    </ScrollView>
  );
}

function CheckInRow({ item }: { item: MoodCheckIn }) {
  const date = new Date(item.datetime);
  return (
    <SoftCard style={styles.rowCard}>
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons color={colors.primaryDeep} name={momentIcon(item.momentType)} size={22} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{momentLabel(item.momentType)}</Text>
        <Text style={styles.rowMeta}>
          {date.toLocaleDateString("es-PE", { day: "numeric", month: "short" })} ·{" "}
          {date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
        </Text>
        <View style={styles.metrics}>
          <Metric label="Ánimo" value={item.mood} />
          <Metric label="Energía" value={item.energy} />
          <Metric label="Dolor" value={item.pain} />
          <Metric label="Estrés" value={item.stress} />
        </View>
        {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
      </View>
    </SoftCard>
  );
}

function DailyLogRow({ log }: { log: DailyLog }) {
  return (
    <SoftCard style={styles.dailyCard}>
      <View style={styles.dailyHeader}>
        <Text style={styles.rowTitle}>{formatShortDate(log.date)}</Text>
        <Text style={styles.bleeding}>{bleedingLabel(log.bleedingLevel)}</Text>
      </View>
      {log.symptoms.length > 0 ? (
        <View style={styles.symptoms}>
          {log.symptoms.map((symptom) => (
            <Text key={symptom} style={styles.symptom}>
              {symptom}
            </Text>
          ))}
        </View>
      ) : (
        <Text style={styles.rowMeta}>Sin síntomas marcados.</Text>
      )}
      {log.notes ? <Text style={styles.note}>{log.notes}</Text> : null}
    </SoftCard>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}/5</Text>
    </View>
  );
}

function EmptyState({ label = "Aún no hay datos. Mensu mostrará patrones cuando haya historial suficiente." }: { label?: string }) {
  return (
    <SoftCard style={styles.empty}>
      <MaterialCommunityIcons color={colors.primaryDeep} name="notebook-outline" size={28} />
      <Text style={styles.emptyText}>{label}</Text>
    </SoftCard>
  );
}

function momentIcon(momentType: MoodCheckIn["momentType"]) {
  if (momentType === "morning") return "weather-sunset-up";
  if (momentType === "night") return "weather-night";
  return "clock-outline";
}

function momentLabel(momentType: MoodCheckIn["momentType"]) {
  if (momentType === "morning") return "Cómo despertaste";
  if (momentType === "night") return "Cómo estuvo tu día";
  return "Cómo te sientes ahora";
}

function bleedingLabel(level: DailyLog["bleedingLevel"]) {
  if (level === "none") return "Sin sangrado";
  if (level === "spotting") return "Manchado";
  if (level === "light") return "Leve";
  if (level === "medium") return "Medio";
  return "Abundante";
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
  actions: {
    flexDirection: "row",
    gap: 10
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: 10
  },
  section: {
    gap: 12
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: type.subtitle,
    fontWeight: "900"
  },
  rowCard: {
    flexDirection: "row",
    gap: 14
  },
  rowIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  rowBody: {
    flex: 1,
    gap: 8
  },
  rowTitle: {
    color: colors.ink,
    fontSize: type.body,
    fontWeight: "900"
  },
  rowMeta: {
    color: colors.muted,
    fontSize: type.small,
    fontWeight: "700"
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  metric: {
    backgroundColor: colors.surfaceSoft,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  metricLabel: {
    color: colors.muted,
    fontSize: type.tiny,
    fontWeight: "900"
  },
  metricValue: {
    color: colors.primaryDeep,
    fontSize: type.small,
    fontWeight: "900",
    marginTop: 2
  },
  note: {
    color: colors.ink,
    fontSize: type.small,
    lineHeight: 18
  },
  dailyCard: {
    gap: 12
  },
  dailyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  bleeding: {
    color: colors.period,
    fontSize: type.small,
    fontWeight: "900"
  },
  symptoms: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  symptom: {
    color: colors.primaryInk,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: type.small,
    fontWeight: "800"
  },
  empty: {
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.primarySoft
  },
  emptyText: {
    color: colors.primaryInk,
    fontSize: type.body,
    lineHeight: 22,
    textAlign: "center",
    fontWeight: "700"
  }
});
