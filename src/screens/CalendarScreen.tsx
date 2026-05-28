import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { SoftButton } from "../components/SoftButton";
import { generateMonthDays, monthTitle, toIsoDate } from "../cycle";
import { colors, radii, shadow, type } from "../theme";
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
                <Pressable accessibilityRole="button" onPress={() => shiftMonth(-1)} style={styles.monthButton}>
                    <MaterialCommunityIcons color={colors.primaryDeep} name="chevron-left" size={26} />
                </Pressable>
                <Text style={styles.title}>{monthTitle(month)}</Text>
                <Pressable accessibilityRole="button" onPress={() => shiftMonth(1)} style={styles.monthButton}>
                    <MaterialCommunityIcons color={colors.primaryDeep} name="chevron-right" size={26} />
                </Pressable>
            </View>

            <View style={styles.calendarPanel}>
                <View style={styles.weekHeader}>
                    {["D", "L", "M", "M", "J", "V", "S"].map((day, index) => (
                        <Text key={`${day}-${index}`} style={styles.weekday}>
                            {day}
                        </Text>
                    ))}
                </View>

                <View style={styles.grid}>
                    {days.map((day) => (
                        <DayCell
                            inMonth={day.inMonth}
                            isLogged={loggedDates.has(day.iso)}
                            isToday={day.iso === todayIso}
                            key={day.iso}
                            monthDay={day.day}
                            phase={day.phase}
                            periodDay={day.phase === "menstrual" ? day.cycleDay : null}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.legend}>
                <Legend color={colors.period} icon="water" label="Regla" />
                <Legend color={colors.fertile} icon="leaf" label="Fértil aprox." />
                <Legend color={colors.luteal} icon="weather-night" label="Lútea" />
                <Legend color={colors.primaryDeep} icon="check-circle" label="Con registro" />
            </View>

            <View style={styles.panel}>
                <Text style={styles.panelTitle}>¿Algo cambió?</Text>
                <Text style={styles.panelText}>Corrige el día real y las próximas fechas se ajustan mejor a ti.</Text>
                <SoftButton label="Registrar mi día" onPress={onOpenCheckIn} />
            </View>
        </ScrollView>
    );
}

function DayCell({
    monthDay,
    inMonth,
    phase,
    periodDay,
    isToday,
    isLogged,
}: {
    monthDay: number;
    inMonth: boolean;
    phase: PhaseKey;
    periodDay: number | null;
    isToday: boolean;
    isLogged: boolean;
}) {
    const phaseStyle = phaseStyles[phase];

    return (
        <View style={[styles.cell, !inMonth && styles.cellMuted]}>
            <View
                style={[
                    styles.dayCircle,
                    phase !== "follicular" && { backgroundColor: phaseStyle.soft },
                    isToday && styles.todayCircle,
                    phase === "fertile" && !isToday && styles.fertileCircle,
                ]}
            >
                {periodDay ? (
                    <View style={styles.periodBadge}>
                        <Text style={styles.periodBadgeText}>{periodDay}</Text>
                    </View>
                ) : null}
                {isLogged ? <View style={[styles.loggedBadge, isToday && styles.loggedBadgeToday]} /> : null}
                <Text
                    style={[
                        styles.dayText,
                        phase !== "follicular" && { color: phaseStyle.ink },
                        !inMonth && styles.dayTextMuted,
                        isToday && styles.dayTextToday,
                    ]}
                >
                    {monthDay}
                </Text>
            </View>
            <View style={[styles.phaseLine, { backgroundColor: phaseStyle.line }, !inMonth && styles.phaseLineMuted]} />
        </View>
    );
}

function Legend({ color, icon, label }: { color: string; icon: string; label: string }) {
    return (
        <View style={styles.legendItem}>
            <MaterialCommunityIcons color={color} name={icon as never} size={15} />
            <Text style={styles.legendText}>{label}</Text>
        </View>
    );
}

const phaseStyles: Record<PhaseKey, { soft: string; ink: string; line: string }> = {
    menstrual: { soft: colors.periodSoft, ink: colors.period, line: "rgba(248,111,143,0.54)" },
    follicular: { soft: colors.surface, ink: colors.ink, line: "rgba(8,124,155,0.08)" },
    fertile: { soft: colors.fertileSoft, ink: colors.success, line: "rgba(61,190,134,0.42)" },
    luteal: { soft: colors.lutealSoft, ink: "#7A5EC9", line: "rgba(122,94,201,0.34)" },
};

const styles = StyleSheet.create({
    content: {
        backgroundColor: colors.background,
        paddingTop: 56,
        paddingHorizontal: 18,
        paddingBottom: 32,
        gap: 18,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    monthButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primarySoft,
    },
    title: {
        color: colors.ink,
        fontSize: type.title,
        fontWeight: "900",
    },
    calendarPanel: {
        backgroundColor: colors.surface,
        borderRadius: radii.xl,
        padding: 12,
        borderWidth: 1,
        borderColor: "rgba(8,124,155,0.08)",
        ...shadow,
    },
    weekHeader: {
        flexDirection: "row",
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(8,124,155,0.08)",
    },
    weekday: {
        width: `${100 / 7}%`,
        textAlign: "center",
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "900",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingTop: 10,
    },
    cell: {
        width: `${100 / 7}%`,
        minHeight: 58,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    cellMuted: {
        opacity: 0.28,
    },
    dayCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
    },
    todayCircle: {
        backgroundColor: colors.primaryDeep,
    },
    fertileCircle: {
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: colors.fertile,
    },
    dayText: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    dayTextMuted: {
        color: colors.muted,
    },
    dayTextToday: {
        color: colors.surface,
    },
    periodBadge: {
        position: "absolute",
        top: -3,
        right: -1,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.period,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
    },
    periodBadgeText: {
        color: colors.surface,
        fontSize: 10,
        fontWeight: "900",
    },
    loggedBadge: {
        position: "absolute",
        left: 1,
        top: 4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primaryDeep,
    },
    loggedBadgeToday: {
        backgroundColor: colors.surface,
    },
    phaseLine: {
        width: 24,
        height: 3,
        borderRadius: 2,
    },
    phaseLineMuted: {
        opacity: 0.4,
    },
    legend: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    legendItem: {
        flexDirection: "row",
        gap: 6,
        alignItems: "center",
        backgroundColor: colors.surface,
        borderRadius: 16,
        paddingHorizontal: 11,
        minHeight: 32,
    },
    legendText: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "800",
    },
    panel: {
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        padding: 18,
        gap: 12,
        borderWidth: 1,
        borderColor: "rgba(8,124,155,0.08)",
    },
    panelTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    panelText: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
    },
});
