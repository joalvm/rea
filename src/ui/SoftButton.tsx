import { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, TextStyle, ViewStyle } from "react-native";

import { accents, colors, elevations, interactions, radii, screen, surfaces, type, weights } from "../theme";

interface SoftButtonProps {
    label: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "ghost";
    disabled?: boolean;
    loading?: boolean;
    icon?: ReactNode;
    style?: StyleProp<ViewStyle>;
    labelStyle?: StyleProp<TextStyle>;
    loadingColor?: string;
}

export function SoftButton({
    label,
    onPress,
    variant = "primary",
    disabled,
    loading,
    icon,
    style,
    labelStyle,
    loadingColor,
}: SoftButtonProps) {
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
                pressed && !disabled && variant === "primary" && styles.primaryPressed,
                pressed && !disabled && variant === "secondary" && styles.secondaryPressed,
                pressed && !disabled && variant === "ghost" && styles.ghostPressed,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    color={loadingColor ?? (variant === "primary" ? colors.primaryInk : colors.primaryDeep)}
                />
            ) : (
                icon
            )}
            <Text
                style={[styles.label, variant === "primary" ? styles.primaryLabel : styles.secondaryLabel, labelStyle]}
            >
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        minHeight: screen.buttonMinHeight,
        borderRadius: radii.lg,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
        paddingHorizontal: 22,
        borderWidth: 1,
        borderColor: surfaces.border,
    },
    primary: {
        backgroundColor: colors.primary,
        borderColor: accents.primary.border,
        ...elevations.card,
    },
    secondary: {
        backgroundColor: surfaces.cardRaised,
        borderColor: accents.primary.border,
    },
    ghost: {
        backgroundColor: surfaces.card,
    },
    disabled: {
        opacity: 0.45,
    },
    pressed: {
        transform: [{ scale: interactions.pressScale }, { translateY: interactions.pressTranslateY }],
        opacity: interactions.pressOpacity,
    },
    primaryPressed: {
        borderColor: accents.primary.ink,
    },
    secondaryPressed: {
        backgroundColor: surfaces.cardSoft,
    },
    ghostPressed: {
        backgroundColor: accents.neutral.tint,
    },
    label: {
        fontFamily: type.family,
        fontSize: type.body,
        fontWeight: weights.bold,
    },
    primaryLabel: {
        color: colors.primaryInk,
    },
    secondaryLabel: {
        color: colors.primaryInk,
    },
});
