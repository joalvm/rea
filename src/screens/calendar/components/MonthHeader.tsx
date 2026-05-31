import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { colors } from "@/theme";
import styles from "../CalendarScreen.styles";

interface MonthHeaderProps {
    monthLabel: string;
    onPrevious: () => void;
    onNext: () => void;
}

/** Renderiza navegación entre meses en encabezado del calendario. */
export default function MonthHeader({ monthLabel, onPrevious, onNext }: MonthHeaderProps) {
    return (
        <View style={styles.calendarHeader}>
            <View style={styles.headerCopy}>
                <Text style={styles.calendarLabel}>Calendario</Text>
                <Text style={styles.monthTitle}>{monthLabel}</Text>
            </View>

            <View style={styles.monthActions}>
                <Pressable
                    accessibilityLabel="Ver mes anterior"
                    accessibilityRole="button"
                    onPress={onPrevious}
                    style={({ pressed }) => [styles.monthButton, pressed && styles.monthButtonPressed]}
                >
                    <MaterialCommunityIcons color={colors.primaryDeep} name="chevron-left" size={24} />
                </Pressable>
                <Pressable
                    accessibilityLabel="Ver mes siguiente"
                    accessibilityRole="button"
                    onPress={onNext}
                    style={({ pressed }) => [styles.monthButton, pressed && styles.monthButtonPressed]}
                >
                    <MaterialCommunityIcons color={colors.primaryDeep} name="chevron-right" size={24} />
                </Pressable>
            </View>
        </View>
    );
}
