import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { accents, colors, radii, surfaces, type } from "../theme";

interface NumberPickerProps {
    label: string;
    value: number;
    suffix: string;
    formatValue?: (value: number) => string;
    min?: number;
    max?: number;
    onChange: (value: number) => void;
}

export function NumberPicker({ label, value, suffix, formatValue, min = 20, max = 40, onChange }: NumberPickerProps) {
    return (
        <View style={styles.numberRow}>
            <Text style={styles.numberLabel}>{label}</Text>
            <View style={styles.numberControl}>
                <Pressable onPress={() => onChange(Math.max(min, value - 1))} style={styles.numberButton}>
                    <MaterialCommunityIcons color={colors.primaryDeep} name="minus" size={18} />
                </Pressable>
                <Text style={styles.numberValue}>
                    {formatValue ? formatValue(value) : value}
                    {suffix ? ` ${suffix}` : ""}
                </Text>
                <Pressable onPress={() => onChange(Math.min(max, value + 1))} style={styles.numberButton}>
                    <MaterialCommunityIcons color={colors.primaryDeep} name="plus" size={18} />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    numberRow: {
        gap: 10,
    },
    numberLabel: {
        color: colors.ink,
        fontSize: type.small,
        fontWeight: "900",
    },
    numberControl: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: radii.lg,
        backgroundColor: surfaces.cardRaised,
        borderWidth: 1,
        borderColor: surfaces.border,
        paddingHorizontal: 8,
        paddingVertical: 8,
        minHeight: 54,
    },
    numberButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: accents.primary.tint,
        alignItems: "center",
        justifyContent: "center",
    },
    numberValue: {
        color: colors.ink,
        fontSize: type.subtitle,
        fontWeight: "900",
        flex: 1,
        textAlign: "center",
        paddingHorizontal: 8,
    },
});
