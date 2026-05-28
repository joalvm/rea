import { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";

import { colors, radii, type } from "../theme";

interface SoftButtonProps {
    label: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "ghost";
    disabled?: boolean;
    loading?: boolean;
    icon?: ReactNode;
    style?: StyleProp<ViewStyle>;
}

export function SoftButton({ label, onPress, variant = "primary", disabled, loading, icon, style }: SoftButtonProps) {
    return (
        <Pressable
            accessibilityRole="button"
            disabled={disabled || loading}
            onPress={onPress}
            style={({ pressed }) => [
                styles.base,
                styles[variant],
                disabled && styles.disabled,
                pressed && !disabled && styles.pressed,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={variant === "primary" ? colors.primaryInk : colors.primaryDeep} />
            ) : (
                icon
            )}
            <Text style={[styles.label, variant === "primary" ? styles.primaryLabel : styles.secondaryLabel]}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        minHeight: 50,
        borderRadius: radii.md,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 22,
        borderWidth: 1,
        borderColor: colors.line,
    },
    primary: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.surfaceSoft,
    },
    ghost: {
        backgroundColor: colors.surface,
    },
    disabled: {
        opacity: 0.45,
    },
    pressed: {
        transform: [{ scale: 0.98 }],
    },
    label: {
        fontFamily: type.family,
        fontSize: type.body,
        fontWeight: "800",
    },
    primaryLabel: {
        color: colors.primaryInk,
    },
    secondaryLabel: {
        color: colors.primaryDeep,
    },
});
