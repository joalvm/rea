import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import generateMonthDays from "@/modules/cycle/calendar/generateMonthDays";
import { monthTitle, toIsoDate } from "@/modules/cycle/shared/cycleDate.utils";
import { Cycle } from "@/types/cycle.types";
import { DailyLog } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";
import { SoftButton } from "@/ui/SoftButton";
import { SoftCard } from "@/ui/SoftCard";
import styles from "./CalendarScreen.styles";
import DayCell from "./components/DayCell";
import MonthHeader from "./components/MonthHeader";

/** Props del screen de calendario del ciclo. */
interface CalendarScreenProps {
    settings: AppSettings | null;
    cycles: Cycle[];
    dailyLogs: DailyLog[];
    onOpenCheckIn: () => void;
    onOpenDay: (iso: string) => void;
}

export function CalendarScreen({ settings, cycles, dailyLogs, onOpenCheckIn, onOpenDay }: CalendarScreenProps) {
    const [month, setMonth] = useState(new Date());
    const todayIso = toIsoDate(new Date());
    const days = useMemo(
        () => generateMonthDays(month, settings, cycles, dailyLogs),
        [cycles, dailyLogs, month, settings],
    );
    const loggedDates = useMemo(() => new Set(dailyLogs.map((log) => log.date)), [dailyLogs]);
    const todayHasLog = loggedDates.has(todayIso);

    const shiftMonth = (delta: number) => {
        setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1, 12));
    };

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.calendarPanel}>
                <MonthHeader
                    monthLabel={monthTitle(month)}
                    onNext={() => shiftMonth(1)}
                    onPrevious={() => shiftMonth(-1)}
                />

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
                            onPress={() => onOpenDay(day.iso)}
                            phase={day.phase}
                            phaseSource={day.phaseSource}
                        />
                    ))}
                </View>

                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendSwatch, styles.legendSwatchObservedPeriod]} />
                        <Text style={styles.legendText}>Regla observada</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendSwatch, styles.legendSwatchEstimatedPeriod]} />
                        <Text style={styles.legendText}>Regla estimada</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendSwatch, styles.legendSwatchFertile]} />
                        <Text style={styles.legendText}>Fértil aprox.</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendSwatch, styles.legendSwatchLuteal]} />
                        <Text style={styles.legendText}>Lútea</Text>
                    </View>
                </View>
            </View>

            <SoftCard style={styles.todayCard} variant="soft">
                <View style={styles.todayCardHeader}>
                    <Text style={styles.todayCardTag}>Hoy</Text>
                    <Text style={styles.todayCardTitle}>¿Quieres añadir algo a este día?</Text>
                </View>
                <Text style={styles.todayCardText}>
                    {todayHasLog
                        ? "Hoy ya tiene registro. Si cambió algo, actualízalo sin salir del calendario."
                        : "Hoy sigue vacío. Regístralo ahora para no perder señales de este día."}
                </Text>
                <SoftButton label={todayHasLog ? "Actualizar hoy" : "Registrar hoy"} onPress={onOpenCheckIn} />
            </SoftCard>
        </ScrollView>
    );
}
