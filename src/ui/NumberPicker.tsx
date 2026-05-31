import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { accents, colors, radii, surfaces, type } from "../theme";

interface NumberPickerProps {
    label: string;
    value: number;
    suffix: string;
    min?: number;
    max?: number;
    onChange: (value: number) => void;
}

export function NumberPicker({ label, value, suffix, min = 20, max = 40, onChange }: NumberPickerProps) {
    return (
        <View style={styles.numberRow}>
            <Text style={styles.numberLabel}>{label}</Text>
            <View style={styles.numberControl}>
                <Pressable onPress={() => onChange(Math.max(min, value - 1))} style={styles.numberButton}>
                    <MaterialCommunityIcons color={colors.primaryDeep} name="minus" size={20} />
                </Pressable>
                <Text style={styles.numberValue}>
                    {value} {suffix}
                </Text>
                <Pressable onPress={() => onChange(Math.min(max, value + 1))} style={styles.numberButton}>
                    <MaterialCommunityIcons color={colors.primaryDeep} name="plus" size={20} />
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
        fontSize: type.body,
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
        padding: 10,
    },
    numberButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: accents.primary.tint,
        alignItems: "center",
        justifyContent: "center",
    },
    numberValue: {
        color: colors.ink,
        fontSize: type.title,
        fontWeight: "900",
    },
});
