import type { LucideIcon } from "lucide-react-native";
import { useRef } from "react";
import { Pressable, Text } from "react-native";

import { useTheme } from "@/theme/useTheme";

import { usePrimaryButtonStyles } from "./PrimaryButtonStyle";

/** Ventana (ms) que ignora pulsaciones repetidas: evita doble navegación / doble submit. */
const PRESS_LOCK_MS = 800;

type Props = {
    label: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "ghost";
    disabled?: boolean;
    accent?: string;
    Icon?: LucideIcon;
    testID?: string;
};

export function PrimaryButton({ label, onPress, variant = "primary", disabled, accent, Icon, testID }: Props) {
    const theme = useTheme();
    const styles = usePrimaryButtonStyles();
    const fillColor = accent ?? theme.colors.primary;
    const lockRef = useRef(false);

    // Una sola navegación por pulsación: bloquea ráfagas de taps que apilarían
    // pantallas duplicadas en el stack (volver atrás mostraría la misma N veces).
    const handlePress = () => {
        if (lockRef.current) return;
        lockRef.current = true;
        onPress();
        setTimeout(() => {
            lockRef.current = false;
        }, PRESS_LOCK_MS);
    };

    if (variant === "secondary") {
        return (
            <Pressable
                onPress={handlePress}
                disabled={disabled}
                testID={testID}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ disabled: !!disabled }}
                style={({ pressed }) => [
                    styles.secondary,
                    pressed && styles.secondaryPressed,
                    disabled && styles.secondaryDisabled,
                ]}
            >
                <Text style={styles.secondaryText}>{label}</Text>
            </Pressable>
        );
    }

    if (variant === "ghost") {
        return (
            <Pressable
                onPress={handlePress}
                disabled={disabled}
                testID={testID}
                accessibilityRole="button"
                accessibilityLabel={label}
                accessibilityState={{ disabled: !!disabled }}
                style={({ pressed }) => [
                    styles.ghost,
                    pressed && styles.ghostPressed,
                    disabled && styles.ghostDisabled,
                ]}
            >
                {Icon ? <Icon size={20} color={theme.colors.link} strokeWidth={2.4} /> : null}
                <Text style={styles.ghostText}>{label}</Text>
            </Pressable>
        );
    }

    return (
        <Pressable
            onPress={handlePress}
            disabled={disabled}
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled: !!disabled }}
            style={({ pressed }) => [
                styles.primary,
                !disabled && { backgroundColor: fillColor, shadowColor: fillColor },
                pressed && styles.primaryPressed,
                disabled && styles.primaryDisabled,
            ]}
        >
            {Icon ? <Icon size={20} color={theme.colors.onPrimary} strokeWidth={2.4} /> : null}
            <Text style={[styles.primaryText, disabled && styles.primaryDisabledText]}>{label}</Text>
        </Pressable>
    );
}
