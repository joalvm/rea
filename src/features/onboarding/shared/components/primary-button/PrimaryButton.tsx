import type { LucideIcon } from "lucide-react-native";
import { Pressable, Text } from "react-native";

import { useTheme } from "@/theme/useTheme";

import { usePrimaryButtonStyles } from "./PrimaryButtonStyle";

type Props = {
    label: string;
    onPress: () => void;
    variant?: "primary" | "secondary";
    disabled?: boolean;
    accent?: string;
    Icon?: LucideIcon;
    testID?: string;
};

export function PrimaryButton({ label, onPress, variant = "primary", disabled, accent, Icon, testID }: Props) {
    const theme = useTheme();
    const styles = usePrimaryButtonStyles();
    const accentColor = accent ?? theme.colors.link;

    if (variant === "secondary") {
        return (
            <Pressable
                onPress={onPress}
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

    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            testID={testID}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ disabled: !!disabled }}
            style={({ pressed }) => [
                styles.primary,
                { borderColor: accentColor },
                pressed && styles.primaryPressed,
                disabled && styles.primaryDisabled,
            ]}
        >
            {Icon ? <Icon size={20} color={accentColor} strokeWidth={2.2} /> : null}
            <Text style={[styles.primaryText, { color: accentColor }, disabled && styles.primaryDisabledText]}>
                {label}
            </Text>
        </Pressable>
    );
}
