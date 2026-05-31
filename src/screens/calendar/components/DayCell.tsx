import { Pressable, Text, View } from "react-native";

import { CycleSnapshot, PhaseKey } from "@/types/cycle.types";
import styles, { phaseStyles } from "../CalendarScreen.styles";

interface DayCellProps {
    dayNumber: number;
    inMonth: boolean;
    phase: PhaseKey;
    phaseSource: CycleSnapshot["source"];
    isToday: boolean;
    isLogged: boolean;
    onPress: () => void;
}

/** Renderiza una celda diaria con estado visual de fase y registro. */
export default function DayCell({ dayNumber, inMonth, phase, phaseSource, isToday, isLogged, onPress }: DayCellProps) {
    const phaseStyle = phaseStyles[phase];
    const isObservedPeriod = phase === "menstrual" && phaseSource === "observed";
    const isEstimatedPeriod = phase === "menstrual" && phaseSource !== "observed";
    const isFertile = phase === "fertile";
    const isLuteal = phase === "luteal";
    const useFilledToday = isToday && !isObservedPeriod && !isEstimatedPeriod && !isFertile && !isLuteal;

    return (
        <Pressable
            accessibilityLabel={buildAccessibilityLabel(dayNumber, phase, isToday, isLogged, phaseSource)}
            accessibilityRole="button"
            onPress={onPress}
            style={({ pressed }) => [styles.cell, !inMonth && styles.cellMuted, pressed && styles.cellPressed]}
        >
            <View
                style={[
                    styles.dayCircle,
                    isObservedPeriod && styles.observedPeriodCircle,
                    isEstimatedPeriod && styles.estimatedPeriodCircle,
                    isFertile && styles.fertileCircle,
                    isLuteal && styles.lutealCircle,
                    useFilledToday && styles.todayCircleFilled,
                    isToday && !useFilledToday && styles.todayCircleOutlined,
                ]}
            >
                <Text
                    style={[
                        styles.dayText,
                        phase !== "follicular" && { color: phaseStyle.ink },
                        !inMonth && styles.dayTextMuted,
                        useFilledToday && styles.dayTextTodayFilled,
                    ]}
                >
                    {dayNumber}
                </Text>
            </View>
        </Pressable>
    );
}

function buildAccessibilityLabel(
    dayNumber: number,
    phase: PhaseKey,
    isToday: boolean,
    isLogged: boolean,
    phaseSource: CycleSnapshot["source"],
) {
    const labels = [`Día ${dayNumber}`];

    if (phase === "menstrual") {
        labels.push(phaseSource === "observed" ? "periodo observado" : "periodo estimado");
    } else if (phase === "fertile") {
        labels.push("fase fértil");
    } else if (phase === "luteal") {
        labels.push("fase lútea");
    } else {
        labels.push("fase folicular");
    }

    if (isToday) {
        labels.push("hoy");
    }

    if (isLogged) {
        labels.push("con anotaciones");
    }

    return labels.join(", ");
}
