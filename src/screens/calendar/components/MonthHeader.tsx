import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { colors } from "@/theme";
import styles from "../CalendarScreen.styles";

interface MonthHeaderProps {
    monthLabel: string;
    onPrevious: () => void;
    onNext: () => void;
}

/** Renderiza navegación entre meses en encabezado del calendario. */
export default function MonthHeader({ monthLabel, onPrevious, onNext }: MonthHeaderProps) {
    const { t } = useTranslation("calendar");

    return (
        <View style={styles.calendarHeader}>
            <Text style={styles.monthTitle}>{monthLabel}</Text>

            <View style={styles.monthActions}>
                <Pressable
                    accessibilityLabel={t("accessibility.previousMonth")}
                    accessibilityRole="button"
                    onPress={onPrevious}
                    style={({ pressed }) => [styles.monthButton, pressed && styles.monthButtonPressed]}
                >
                    <MaterialCommunityIcons color={colors.primaryDeep} name="chevron-left" size={24} />
                </Pressable>
                <Pressable
                    accessibilityLabel={t("accessibility.nextMonth")}
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
