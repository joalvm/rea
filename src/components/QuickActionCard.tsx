import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radii, type } from "../theme";

type Tone = "primary" | "period" | "fertile" | "luteal";

interface QuickActionCardProps {
    title: string;
    hint: string;
    icon: string;
    tone: Tone;
    onPress: () => void;
}

const tones: Record<Tone, { bg: string; iconBg: string; ink: string }> = {
    primary: { bg: colors.surface, iconBg: colors.primarySoft, ink: colors.primaryDeep },
    period: { bg: "#FFF7FA", iconBg: colors.periodSoft, ink: colors.period },
    fertile: { bg: "#F7FFFC", iconBg: colors.fertileSoft, ink: colors.success },
    luteal: { bg: "#FBF8FF", iconBg: colors.lutealSoft, ink: "#7A5EC9" },
};

export function QuickActionCard({ title, hint, icon, tone, onPress }: QuickActionCardProps) {
    const palette = tones[tone];

    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            style={({ pressed }) => [styles.card, { backgroundColor: palette.bg }, pressed && styles.pressed]}
        >
            <View style={[styles.iconWrap, { backgroundColor: palette.iconBg }]}>
                <MaterialCommunityIcons color={palette.ink} name={icon as never} size={27} />
            </View>
            <Text numberOfLines={1} style={styles.title}>
                {title}
            </Text>
            <Text numberOfLines={1} style={[styles.hint, { color: palette.ink }]}>
                {hint}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: 126,
        minHeight: 118,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: "rgba(8, 124, 155, 0.08)",
        padding: 14,
        justifyContent: "space-between",
    },
    pressed: {
        transform: [{ scale: 0.98 }],
    },
    iconWrap: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        color: colors.ink,
        fontSize: type.body,
        fontWeight: "900",
        marginTop: 12,
    },
    hint: {
        fontSize: type.small,
        fontWeight: "900",
    },
});
