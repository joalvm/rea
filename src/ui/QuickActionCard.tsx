import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { accents, elevations, interactions, radii, surfaces, type } from "../theme";

type Tone = "primary" | "period" | "fertile" | "luteal";

interface QuickActionCardProps {
    title: string;
    hint: string;
    icon: string;
    tone: Tone;
    onPress: () => void;
}

const tones: Record<Tone, { border: string; iconBg: string; ink: string }> = {
    primary: { border: accents.primary.border, iconBg: accents.primary.tint, ink: accents.primary.ink },
    period: { border: accents.period.border, iconBg: accents.period.tint, ink: accents.period.ink },
    fertile: { border: accents.fertile.border, iconBg: accents.fertile.tint, ink: accents.fertile.ink },
    luteal: { border: accents.luteal.border, iconBg: accents.luteal.tint, ink: accents.luteal.ink },
};

export function QuickActionCard({ title, hint, icon, tone, onPress }: QuickActionCardProps) {
    const palette = tones[tone];

    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            style={({ pressed }) => [styles.card, { borderColor: palette.border }, pressed && styles.pressed]}
        >
            <View style={[styles.iconWrap, { backgroundColor: palette.iconBg }]}>
                <MaterialCommunityIcons color={palette.ink} name={icon as never} size={27} />
            </View>
            <Text numberOfLines={1} style={styles.title}>
                {title}
            </Text>
            <View style={[styles.hintPill, { backgroundColor: palette.iconBg }]}>
                <Text numberOfLines={1} style={[styles.hint, { color: palette.ink }]}>
                    {hint}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 126,
        minHeight: 118,
        borderRadius: radii.lg,
        borderWidth: 1,
        backgroundColor: surfaces.cardRaised,
        padding: 14,
        justifyContent: "space-between",
        ...elevations.card,
    },
    pressed: {
        transform: [{ scale: interactions.pressScale }, { translateY: interactions.pressTranslateY }],
        opacity: interactions.pressOpacity,
    },
    iconWrap: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        color: accents.neutral.ink,
        fontSize: type.body,
        fontWeight: "900",
        marginTop: 12,
    },
    hintPill: {
        alignSelf: "flex-start",
        minHeight: 26,
        borderRadius: radii.pill,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    hint: {
        fontSize: type.small,
        fontWeight: "900",
    },
});
