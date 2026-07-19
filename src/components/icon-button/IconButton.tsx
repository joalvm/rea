import type { LucideIcon } from "lucide-react-native";
import { Pressable } from "react-native";

import { useTheme } from "@/theme/useTheme";

import { useIconButtonStyles } from "./IconButtonStyle";

type Props = {
    Icon: LucideIcon;
    accessibilityLabel: string;
    accessibilityHint?: string;
    onPress: () => void;
    disabled?: boolean;
    testID?: string;
    variant?: "surface" | "ghost";
};

/** Acción solo-icono para navegación local o controles compactos. Nunca sustituye una CTA con texto. */
export function IconButton({
    Icon,
    accessibilityLabel,
    accessibilityHint,
    onPress,
    disabled = false,
    testID,
    variant = "surface",
}: Props) {
    const theme = useTheme();
    const styles = useIconButtonStyles();

    return (
        <Pressable
            accessibilityHint={accessibilityHint}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={onPress}
            testID={testID}
            style={({ pressed }) => [
                styles.button,
                variant === "ghost" && styles.ghost,
                pressed && styles.pressed,
                disabled && styles.disabled,
            ]}
        >
            <Icon size={theme.sizing.iconMd} color={theme.colors.iconStrong} strokeWidth={2.4} />
        </Pressable>
    );
}
