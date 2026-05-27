import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { SoftButton } from "../components/SoftButton";
import { generateMonthDays, monthTitle, toIsoDate } from "../cycle";
import { colors, radii, type } from "../theme";
import { AppSettings, DailyLog, PhaseKey } from "../types";

interface CalendarScreenProps {
  settings: AppSettings | null;
  dailyLogs: DailyLog[];
  onOpenCheckIn: () => void;
}

export function CalendarScreen({ settings, dailyLogs, onOpenCheckIn }: CalendarScreenProps) {
  const [month, setMonth] = useState(new Date());
  const todayIso = toIsoDate(new Date());
  const days = useMemo(() => generateMonthDays(month, settings), [month, settings]);
  const loggedDates = useMemo(() => new Set(dailyLogs.map((log) => log.date)), [dailyLogs]);

  const shiftMonth = (delta: number) => {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1, 12));
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable onPress={() => shiftMonth(-1)} style={styles.monthButton}>
          <MaterialCommunityIcons color={colors.primaryDeep} name="chevron-left" size={26} />
        </Pressable>
        <Text style={styles.title}>{monthTitle(month)}</Text>
        <Pressable onPress={() => shiftMonth(1)} style={styles.monthButton}>
          <MaterialCommunityIcons color={colors.primaryDeep} name="chevron-right" size={26} />
        </Pressable>
      </View>

      <View style={styles.weekHeader}>
        {["D", "L", "M", "M", "J", "V", "S"].map((day, index) => (
          <Text key={`${day}-${index}`} style={styles.weekday}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day) => {
          const logged = loggedDates.has(day.iso);
          const today = day.iso === todayIso;
          return (
            <View key={day.iso} style={[styles.cell, !day.inMonth && styles.cellMuted, today && styles.cellToday]}>
              <Text style={[styles.dayText, !day.inMonth && styles.dayTextMuted, today && styles.dayTextToday]}>{day.day}</Text>
              <View style={styles.marks}>
                <View style={[styles.phaseMark, { backgroundColor: phaseColor(day.phase) }]} />
                {logged ? <View style={styles.loggedMark} /> : null}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        <Legend color={colors.period} label="Periodo" />
        <Legend color={colors.fertile} label="Fértil aprox." />
        <Legend color={colors.luteal} label="Lútea" />
        <Legend color={colors.primaryDeep} label="Registrado" />
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Correcciones rápidas</Text>
        <Text style={styles.panelText}>
          Si una predicción no coincide, registra el día real. Mensu ajusta próximos cálculos desde tus datos.
        </Text>
        <SoftButton label="Registrar hoy" onPress={onOpenCheckIn} />
      </View>
    </ScrollView>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function phaseColor(phase: PhaseKey) {
  if (phase === "menstrual") return colors.period;
  if (phase === "fertile") return colors.fertile;
  if (phase === "luteal") return colors.luteal;
  return colors.primary;
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    paddingTop: 56,
    paddingHorizontal: 18,
    paddingBottom: 32,
    gap: 18
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  monthButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft
  },
  title: {
    color: colors.ink,
    fontSize: type.title,
    fontWeight: "900",
    textTransform: "capitalize"
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4
  },
  weekday: {
    width: `${100 / 7}%`,
    textAlign: "center",
    color: colors.muted,
    fontSize: type.small,
    fontWeight: "900"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 8,
    borderWidth: 1,
    borderColor: "rgba(8,124,155,0.08)"
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 0.84,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    gap: 7
  },
  cellMuted: {
    opacity: 0.34
  },
  cellToday: {
    backgroundColor: colors.primaryDeep
  },
  dayText: {
    color: colors.ink,
    fontSize: type.body,
    fontWeight: "900"
  },
  dayTextMuted: {
    color: colors.muted
  },
  dayTextToday: {
    color: colors.surface
  },
  marks: {
    minHeight: 7,
    flexDirection: "row",
    gap: 4
  },
  phaseMark: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  loggedMark: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryDeep
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  legendItem: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 11,
    minHeight: 32
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  legendText: {
    color: colors.muted,
    fontSize: type.small,
    fontWeight: "800"
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: 18,
    gap: 12
  },
  panelTitle: {
    color: colors.ink,
    fontSize: type.subtitle,
    fontWeight: "900"
  },
  panelText: {
    color: colors.muted,
    fontSize: type.body,
    lineHeight: 22
  }
});
