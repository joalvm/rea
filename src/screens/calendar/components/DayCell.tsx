import { Text, View } from "react-native";

import { CycleSnapshot, PhaseKey } from "@/types/cycle.types";
import styles, { phaseStyles } from "../CalendarScreen.styles";

interface DayCellProps {
    dayNumber: number;
    inMonth: boolean;
    phase: PhaseKey;
    phaseSource: CycleSnapshot["source"];
    periodDay: number | null;
    isToday: boolean;
    isLogged: boolean;
}

/** Renderiza una celda diaria con estado visual de fase y registro. */
export default function DayCell({
    dayNumber,
    inMonth,
    phase,
    phaseSource,
    periodDay,
    isToday,
    isLogged,
}: DayCellProps) {
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
                    {dayNumber}
                </Text>
            </View>
            <View style={[styles.phaseLine, { backgroundColor: phaseStyle.line }, !inMonth && styles.phaseLineMuted]} />
        </View>
    );
}
