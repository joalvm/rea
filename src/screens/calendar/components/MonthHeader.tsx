import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { colors } from "../../../theme";
import styles from "../CalendarScreen.styles";

interface MonthHeaderProps {
    monthLabel: string;
    onPrevious: () => void;
    onNext: () => void;
}

/** Renderiza navegación entre meses en encabezado del calendario. */
export default function MonthHeader({ monthLabel, onPrevious, onNext }: MonthHeaderProps) {
    return (
        <View style={styles.header}>
            <View>
                <Text style={styles.kicker}>Calendario</Text>
                <Text style={styles.title}>{monthLabel}</Text>
            </View>
            <View style={styles.monthActions}>
                <Pressable accessibilityRole="button" onPress={onPrevious} style={styles.monthButton}>
                    <MaterialCommunityIcons color={colors.primaryDeep} name="chevron-left" size={24} />
                </Pressable>
                <Pressable accessibilityRole="button" onPress={onNext} style={styles.monthButton}>
                    <MaterialCommunityIcons color={colors.primaryDeep} name="chevron-right" size={24} />
                </Pressable>
            </View>
        </View>
    );
}
