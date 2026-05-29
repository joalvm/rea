import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import generateMonthDays from "../../modules/cycle/calendar/generateMonthDays";
import { monthTitle, toIsoDate } from "../../modules/cycle/shared/cycleDate.utils";
import { colors } from "../../theme";
import { Cycle, CycleSnapshot } from "../../types/cycle.types";
import { DailyLog } from "../../types/records.types";
import { AppSettings } from "../../types/settings.types";
import { SoftButton } from "../../ui/SoftButton";
import { SoftCard } from "../../ui/SoftCard";
import styles from "./CalendarScreen.styles";
import CalendarLegend from "./components/CalendarLegend";
import DayCell from "./components/DayCell";
import MonthHeader from "./components/MonthHeader";

/** Props del screen de calendario del ciclo. */
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
            <MonthHeader
                monthLabel={monthTitle(month)}
                onNext={() => shiftMonth(1)}
                onPrevious={() => shiftMonth(-1)}
            />

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
                        <CalendarLegend
                            color={colors.period}
                            icon="water"
                            label={`${monthSummary.observedPeriodDays} días observados`}
                        />
                    ) : null}
                    {monthSummary.estimatedPeriodDays > 0 ? (
                        <CalendarLegend
                            color={colors.period}
                            icon="circle-outline"
                            label={`${monthSummary.estimatedPeriodDays} días estimados`}
                        />
                    ) : null}
                    {monthSummary.observedPeriodDays === 0 && monthSummary.estimatedPeriodDays === 0 ? (
                        <CalendarLegend
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
                            dayNumber={day.day}
                            inMonth={day.inMonth}
                            isLogged={loggedDates.has(day.iso)}
                            isToday={day.iso === todayIso}
                            key={day.iso}
                            phase={day.phase}
                            phaseSource={day.phaseSource}
                            periodDay={day.phase === "menstrual" ? day.cycleDay : null}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.legend}>
                <CalendarLegend color={colors.period} icon="water" label="Regla observada" />
                <CalendarLegend color={colors.period} icon="circle-outline" label="Regla estimada" />
                {snapshot.fertilityVisible ? (
                    <CalendarLegend color={colors.fertile} icon="leaf" label="Fértil aprox." />
                ) : null}
                <CalendarLegend color={colors.luteal} icon="weather-night" label="Lútea" />
                <CalendarLegend color={colors.primaryDeep} icon="check-circle" label="Con registro" />
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
