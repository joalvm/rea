import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, type } from "../theme";

interface MetricScaleProps {
    label: string;
    value: number;
    lowLabel: string;
    highLabel: string;
    onChange: (value: number) => void;
}

export function MetricScale({ label, value, lowLabel, highLabel, onChange }: MetricScaleProps) {
    return (
        <View style={styles.wrap}>
            <View style={styles.header}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}/5</Text>
            </View>
            <View style={styles.scale}>
                {[1, 2, 3, 4, 5].map((option) => (
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`${label} ${option}`}
                        key={option}
                        onPress={() => onChange(option)}
                        style={[styles.dot, option <= value && styles.dotActive]}
                    >
                        <Text style={[styles.dotText, option <= value && styles.dotTextActive]}>{option}</Text>
                    </Pressable>
                ))}
            </View>
            <View style={styles.captions}>
                <Text style={styles.caption}>{lowLabel}</Text>
                <Text style={styles.caption}>{highLabel}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        gap: 10,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    label: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "800",
    },
    value: {
        color: colors.primaryDeep,
        fontSize: type.small,
        fontWeight: "800",
    },
    scale: {
        flexDirection: "row",
        gap: 8,
    },
    dot: {
        flex: 1,
        minHeight: 42,
        borderRadius: radii.md,
        backgroundColor: colors.surfaceSoft,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(8, 124, 155, 0.08)",
    },
    dotActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    dotText: {
        color: colors.muted,
        fontSize: type.body,
        fontWeight: "800",
    },
    dotTextActive: {
        color: colors.primaryInk,
    },
    captions: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    caption: {
        color: colors.muted,
        fontSize: type.small,
        fontWeight: "600",
    },
});
