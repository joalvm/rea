import type { LucideIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

import { useTheme } from "@/theme/useTheme";

import { useToggleRowStyles } from "./ToggleRowStyle";

type Props = {
    title: string;
    subtitle?: string;
    Icon?: LucideIcon;
    value: boolean;
    onChange: (value: boolean) => void;
    accent?: string;
    testID?: string;
};

export function ToggleRow({ title, subtitle, Icon, value, onChange, accent, testID }: Props) {
    const theme = useTheme();
    const styles = useToggleRowStyles();
    const onColor = accent ?? theme.colors.primary;

    const trackStyle = useAnimatedStyle(() => ({
        backgroundColor: withTiming(value ? onColor : theme.colors.surfaceSunken, { duration: 160 }),
        borderColor: withTiming(value ? onColor : theme.colors.divider, { duration: 160 }),
    }));

    const knobStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: withTiming(value ? 20 : 0, { duration: 160 }) }],
        borderColor: withTiming(value ? "transparent" : theme.colors.border, { duration: 160 }),
    }));

    return (
        <Pressable
            onPress={() => onChange(!value)}
            testID={testID}
            accessibilityRole="switch"
            accessibilityState={{ checked: value }}
            accessibilityLabel={title}
            style={styles.row}
        >
            <View style={styles.text}>
                <View style={styles.titleRow}>
                    {Icon ? <Icon size={16} color={theme.colors.textSecondary} strokeWidth={2.2} /> : null}
                    <Text style={styles.title}>{title}</Text>
                </View>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <Animated.View style={[styles.track, trackStyle]} pointerEvents="none">
                <Animated.View style={[styles.knob, knobStyle]} />
            </Animated.View>
        </Pressable>
    );
}
