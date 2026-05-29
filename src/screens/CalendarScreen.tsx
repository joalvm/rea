import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import generateMonthDays from "../modules/cycle/calendar/generateMonthDays";
import { monthTitle, toIsoDate } from "../modules/cycle/shared/cycleDate.utils";
import { colors, radii, type } from "../theme";
import { Cycle, CycleSnapshot, PhaseKey } from "../types/cycle.types";
import { DailyLog } from "../types/records.types";
import { AppSettings } from "../types/settings.types";
import { SoftButton } from "../ui/SoftButton";
import { SoftCard } from "../ui/SoftCard";

interface CalendarScreenProps {
    settings: AppSettings | null;
    cycles: Cycle[];
    dailyLogs: DailyLog[];
    snapshot: CycleSnapshot;
    onOpenCheckIn: () => void;
}

export function CalendarScreen({ settings, cycles, dailyLogs, snapshot, onOpenCheckIn }: CalendarScreenProps) {
    const [month, setMonth] = useState(new Date());
    const todayIso = toIsoDate(new Date());
    const days = useMemo(
        () => generateMonthDays(month, settings, cycles, dailyLogs),
        [cycles, dailyLogs, month, settings],
    );
    const loggedDates = useMemo(() => new Set(dailyLogs.map((log) => log.date)), [dailyLogs]);
    const monthSummary = useMemo(() => {
        const inMonthDays = days.filter((day) => day.inMonth);

        return {
            loggedCount: inMonthDays.filter((day) => loggedDates.has(day.iso)).length,
            observedPeriodDays: inMonthDays.filter((day) => day.phase === "menstrual" && day.phaseSource === "observed")
                .length,
            estimatedPeriodDays: inMonthDays.filter(
                (day) => day.phase === "menstrual" && day.phaseSource !== "observed",
            ).length,
        };
    }, [days, loggedDates]);

    const shiftMonth = (delta: number) => {
        setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1, 12));
    };

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.kicker}>Calendario</Text>
                    <Text style={styles.title}>{monthTitle(month)}</Text>
                </View>
                <View style={styles.monthActions}>
                    <Pressable accessibilityRole="button" onPress={() => shiftMonth(-1)} style={styles.monthButton}>
                        <MaterialCommunityIcons color={colors.primaryDeep} name="chevron-left" size={24} />
                    </Pressable>
                    <Pressable accessibilityRole="button" onPress={() => shiftMonth(1)} style={styles.monthButton}>
                        <MaterialCommunityIcons color={colors.primaryDeep} name="chevron-right" size={24} />
                    </Pressable>
                </View>
            </View>

            <SoftCard style={styles.summaryCard}>
                <View style={styles.summaryTop}>
                    <View>
                        <Text style={styles.summaryTitle}>Qué pesa más este mes</Text>
                        <Text style={styles.summaryText}>
                            {snapshot.sourceLabel} y {snapshot.confidenceLabel.toLowerCase()} para leer este tramo.
                        </Text>
                    </View>
                    <View style={styles.summaryBadge}>
                        <Text style={styles.summaryBadgeText}>{monthSummary.loggedCount} registros</Text>
                    </View>
                </View>
                <View style={styles.summaryMetrics}>
                    {monthSummary.observedPeriodDays > 0 ? (
                        <Legend
                            color={colors.period}
                            icon="water"
                            label={`${monthSummary.observedPeriodDays} días observados`}
                        />
                    ) : null}
                    {monthSummary.estimatedPeriodDays > 0 ? (
                        <Legend
                            color={colors.period}
                            icon="circle-outline"
                            label={`${monthSummary.estimatedPeriodDays} días estimados`}
                        />
                    ) : null}
                    {monthSummary.observedPeriodDays === 0 && monthSummary.estimatedPeriodDays === 0 ? (
                        <Legend
                            color={colors.primaryDeep}
                            icon="calendar-blank-outline"
                            label="Sin periodo en este mes"
                        />
                    ) : null}
                </View>
            </SoftCard>

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
                            phaseSource={day.phaseSource}
                            periodDay={day.phase === "menstrual" ? day.cycleDay : null}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.legend}>
                <Legend color={colors.period} icon="water" label="Regla observada" />
                <Legend color={colors.period} icon="circle-outline" label="Regla estimada" />
                {snapshot.fertilityVisible ? <Legend color={colors.fertile} icon="leaf" label="Fértil aprox." /> : null}
                <Legend color={colors.luteal} icon="weather-night" label="Lútea" />
                <Legend color={colors.primaryDeep} icon="check-circle" label="Con registro" />
            </View>

            <View style={styles.panel}>
                <Text style={styles.panelTitle}>¿Algo cambió?</Text>
                <Text style={styles.panelText}>
                    Base actual: {snapshot.sourceLabel.toLowerCase()} y {snapshot.confidenceLabel.toLowerCase()}. Marca
                    tus días reales para ajustar mejor las estimaciones.
                </Text>
                <SoftButton label="Registrar mi día" onPress={onOpenCheckIn} />
            </View>
        </ScrollView>
    );
}

function DayCell({
    monthDay,
    inMonth,
    phase,
    phaseSource,
    periodDay,
    isToday,
    isLogged,
}: {
    monthDay: number;
    inMonth: boolean;
    phase: PhaseKey;
    phaseSource: CycleSnapshot["source"];
    periodDay: number | null;
    isToday: boolean;
    isLogged: boolean;
}) {
    const phaseStyle = phaseStyles[phase];
    const isObservedPeriod = phase === "menstrual" && phaseSource === "observed";
    const isEstimatedPeriod = phase === "menstrual" && phaseSource !== "observed";

    return (
        <View style={[styles.cell, !inMonth && styles.cellMuted]}>
            <View
                style={[
                    styles.dayCircle,
                    isToday && styles.todayCircle,
                    isObservedPeriod && !isToday && styles.observedPeriodCircle,
                    isEstimatedPeriod && !isToday && styles.estimatedPeriodCircle,
                    phase === "fertile" && !isToday && styles.fertileCircle,
                ]}
            >
                {periodDay && isEstimatedPeriod ? <View style={styles.periodBadge} /> : null}
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
        paddingTop: 44,
        paddingHorizontal: 20,
        paddingBottom: 32,
        gap: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    kicker: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "900",
        textTransform: "uppercase",
    },
    monthActions: {
        flexDirection: "row",
        gap: 8,
    },
    monthButton: {
        width: 44,
        height: 44,
        borderRadius: radii.md,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.line,
    },
    title: {
        color: colors.ink,
        fontSize: 28,
        fontWeight: "900",
        marginTop: 4,
    },
    summaryCard: {
        gap: 14,
    },
    summaryTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    summaryTitle: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
    },
    summaryText: {
        color: colors.muted,
        fontSize: type.body,
        lineHeight: 22,
        marginTop: 4,
        maxWidth: 240,
    },
    summaryBadge: {
        minHeight: 32,
        borderRadius: 16,
        paddingHorizontal: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.surfaceSoft,
        borderWidth: 1,
        borderColor: colors.line,
    },
    summaryBadgeText: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "900",
    },
    summaryMetrics: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    calendarPanel: {
        backgroundColor: colors.surface,
        borderRadius: radii.md,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.line,
    },
    weekHeader: {
        flexDirection: "row",
        paddingBottom: 8,
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
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
    todayCircle: {
        backgroundColor: colors.primaryDeep,
    },
    observedPeriodCircle: {
        backgroundColor: colors.periodSoft,
        borderWidth: 1,
        borderColor: colors.period,
    },
    estimatedPeriodCircle: {
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: colors.period,
        backgroundColor: colors.surface,
    },
    fertileCircle: {
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: colors.fertile,
    },
    dayText: {
        color: colors.ink,
        fontSize: type.body - 2,
        fontWeight: "800",
    },
    dayTextMuted: {
        color: colors.muted,
    },
    dayTextToday: {
        color: colors.surface,
    },
    periodBadge: {
        position: "absolute",
        top: 5,
        right: 5,
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: colors.period,
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
        gap: 2,
        alignItems: "center",
        backgroundColor: colors.surfaceSoft,
        borderRadius: 16,
        paddingHorizontal: 11,
        minHeight: 32,
        borderWidth: 1,
        borderColor: colors.line,
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
        borderColor: colors.line,
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
