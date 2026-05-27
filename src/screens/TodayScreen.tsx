import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { SoftButton } from "../components/SoftButton";
import { SoftCard } from "../components/SoftCard";
import { WeekStrip } from "../components/WeekStrip";
import { buildPersonalInsights } from "../cycle";
import { colors, radii, shadow, type } from "../theme";
import { CycleSnapshot, DailyLog, MoodCheckIn } from "../types";

interface TodayScreenProps {
  snapshot: CycleSnapshot;
  moodCheckIns: MoodCheckIn[];
  dailyLogs: DailyLog[];
  onOpenCheckIn: () => void;
  onOpenQuickCheckIn: () => void;
  onOpenSchedule: () => void;
}

export function TodayScreen({
  snapshot,
  moodCheckIns,
  dailyLogs,
  onOpenCheckIn,
  onOpenQuickCheckIn,
  onOpenSchedule
}: TodayScreenProps) {
  const insights = buildPersonalInsights(moodCheckIns, dailyLogs);

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroBlobLarge} />
        <View style={styles.heroBlobSmall} />
        <View style={styles.topRow}>
          <View style={styles.logo}>
            <MaterialCommunityIcons color={colors.primaryDeep} name="moon-waning-crescent" size={22} />
          </View>
          <Text style={styles.date}>{new Date().toLocaleDateString("es-PE", { day: "numeric", month: "long" })}</Text>
          <SoftButton label="Horario" onPress={onOpenSchedule} style={styles.scheduleButton} variant="ghost" />
        </View>

        <WeekStrip week={snapshot.week} />

        <View style={styles.phaseBlock}>
          <Text style={styles.phaseLabel}>{snapshot.phaseLabel}</Text>
          <Text style={styles.phaseDay}>Día {snapshot.cycleDay}</Text>
          <Text style={styles.phaseMessage}>{snapshot.phaseMessage}</Text>
        </View>

        <SoftButton label="Registrar hoy" onPress={onOpenCheckIn} style={styles.heroButton} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <ScrollView horizontal contentContainerStyle={styles.quickCards} showsHorizontalScrollIndicator={false}>
          <QuickCard icon="plus" label="Check-in corto" onPress={onOpenQuickCheckIn} tone="primary" />
          <QuickCard icon="calendar-clock" label={`Periodo en ${snapshot.nextPeriodInDays} días`} tone="period" />
          <QuickCard icon="leaf" label={snapshot.fertileWindowLabel} tone="fertile" />
          <QuickCard icon="chart-line" label="Ver patrones propios" tone="luteal" />
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Qué observar hoy</Text>
        <SoftCard style={styles.insightCard}>
          {insights.map((insight, index) => (
            <View key={insight} style={styles.insightRow}>
              <View style={styles.insightDot}>
                <Text style={styles.insightNumber}>{index + 1}</Text>
              </View>
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </SoftCard>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacidad</Text>
        <SoftCard style={styles.privacyCard}>
          <MaterialCommunityIcons color={colors.primaryDeep} name="shield-lock-outline" size={26} />
          <Text style={styles.privacyText}>
            Tus registros viven localmente. Mensu usa frases como “parece” o “suele” porque no diagnostica.
          </Text>
        </SoftCard>
      </View>
    </ScrollView>
  );
}

interface QuickCardProps {
  label: string;
  icon: string;
  tone: "primary" | "period" | "fertile" | "luteal";
  onPress?: () => void;
}

function QuickCard({ label, icon, tone, onPress }: QuickCardProps) {
  return (
    <SoftButton
      icon={<MaterialCommunityIcons color={toneTextColor(tone)} name={icon as never} size={24} />}
      label={label}
      onPress={onPress ?? (() => undefined)}
      style={[styles.quickCard, { backgroundColor: toneColor(tone) }]}
      variant="secondary"
    />
  );
}

function toneColor(tone: QuickCardProps["tone"]) {
  if (tone === "period") return colors.periodSoft;
  if (tone === "fertile") return colors.fertileSoft;
  if (tone === "luteal") return colors.lutealSoft;
  return colors.primarySoft;
}

function toneTextColor(tone: QuickCardProps["tone"]) {
  if (tone === "period") return colors.period;
  if (tone === "fertile") return colors.success;
  if (tone === "luteal") return "#7A5EC9";
  return colors.primaryDeep;
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
    backgroundColor: colors.background
  },
  hero: {
    minHeight: 392,
    paddingTop: 54,
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: colors.primarySoft,
    overflow: "hidden"
  },
  heroBlobLarge: {
    position: "absolute",
    right: -90,
    top: 82,
    width: 290,
    height: 220,
    borderRadius: 130,
    backgroundColor: "rgba(124, 217, 249, 0.54)",
    transform: [{ rotate: "-10deg" }]
  },
  heroBlobSmall: {
    position: "absolute",
    left: -62,
    top: 122,
    width: 220,
    height: 180,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.48)",
    transform: [{ rotate: "18deg" }]
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...shadow
  },
  date: {
    color: colors.ink,
    fontSize: type.subtitle,
    fontWeight: "900",
    textTransform: "capitalize"
  },
  scheduleButton: {
    minHeight: 40,
    paddingHorizontal: 14
  },
  phaseBlock: {
    alignItems: "center",
    marginTop: 40
  },
  phaseLabel: {
    color: colors.ink,
    fontSize: type.subtitle,
    fontWeight: "800"
  },
  phaseDay: {
    color: colors.ink,
    fontSize: 42,
    lineHeight: 50,
    fontWeight: "900",
    marginTop: 4
  },
  phaseMessage: {
    color: colors.primaryInk,
    fontSize: type.body,
    lineHeight: 22,
    textAlign: "center",
    marginTop: 14,
    maxWidth: 310
  },
  heroButton: {
    alignSelf: "center",
    marginTop: 22,
    minWidth: 172
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: type.subtitle,
    fontWeight: "900"
  },
  quickCards: {
    gap: 12,
    paddingRight: 20
  },
  quickCard: {
    width: 154,
    minHeight: 116,
    borderRadius: radii.lg,
    paddingVertical: 18,
    alignItems: "center",
    flexDirection: "column"
  },
  insightCard: {
    gap: 14
  },
  insightRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start"
  },
  insightDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  insightNumber: {
    color: colors.primaryDeep,
    fontSize: type.small,
    fontWeight: "900"
  },
  insightText: {
    flex: 1,
    color: colors.ink,
    fontSize: type.body,
    lineHeight: 22
  },
  privacyCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: colors.primarySoft
  },
  privacyText: {
    flex: 1,
    color: colors.primaryInk,
    fontSize: type.body,
    lineHeight: 22,
    fontWeight: "700"
  }
});
