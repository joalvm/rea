import type { LucideIcon } from "lucide-react-native";
import { Check } from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { useTheme } from "@/theme/useTheme";

import { useSelectableCardStyles } from "./SelectableCardStyle";

type Props = {
    title: string;
    subtitle?: string;
    Icon?: LucideIcon;
    extra?: ReactNode;
    selected: boolean;
    onPress: () => void;
    testID?: string;
};

/**
 * Tarjeta de selección horizontal y reutilizable: icono a la izquierda en una
 * burbuja, título y subtítulo a la derecha, y un badge de check al seleccionar.
 * Neutral al dominio: sirve para onboarding, check-in o cualquier flujo que
 * necesite elegir una opción de una lista.
 */
export function SelectableCard({ title, subtitle, Icon, extra, selected, onPress, testID }: Props) {
    const theme = useTheme();
    const styles = useSelectableCardStyles();

    return (
        <Pressable
            onPress={onPress}
            testID={testID}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={title}
            style={[styles.card, selected && styles.cardOn]}
        >
            {Icon ? (
                <View style={[styles.iconBubble, selected && styles.iconBubbleOn]}>
                    <Icon size={22} color={selected ? theme.colors.onPrimary : theme.colors.link} strokeWidth={2.2} />
                </View>
            ) : null}
            <View style={styles.textWrap}>
                <Text style={styles.title}>{title}</Text>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                {extra}
            </View>
            {selected ? (
                <View style={styles.check}>
                    <Check size={14} color={theme.colors.onPrimary} strokeWidth={3} />
                </View>
            ) : null}
        </Pressable>
    );
}
