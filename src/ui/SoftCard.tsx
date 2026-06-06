import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

import { AccentToneName, accents, elevations, radii, surfaces } from "@/theme";

interface SoftCardProps {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: "default" | "soft" | "accent";
    tone?: AccentToneName;
}

export function SoftCard({ children, style, variant = "default", tone = "neutral" }: SoftCardProps) {
    const palette = accents[tone];

    return (
        <View
            style={[
                styles.card,
                variant === "soft" && styles.softCard,
                variant === "accent" && {
                    backgroundColor: palette.tint,
                    borderColor: palette.border,
                },
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: surfaces.cardRaised,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: surfaces.border,
        padding: 20,
        ...elevations.card,
    },
    softCard: {
        backgroundColor: surfaces.cardSoft,
        borderColor: surfaces.borderStrong,
    },
});
