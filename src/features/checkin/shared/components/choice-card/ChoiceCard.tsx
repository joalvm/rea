import type { LucideIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { useTheme } from "@/theme/useTheme";

import { useChoiceCardStyles } from "./ChoiceCardStyle";

type Props = {
    Icon?: LucideIcon;
    label: string;
    description?: string;
    selected: boolean;
    onPress: () => void;
    testID?: string;
};

/**
 * Tarjeta de elección compacta del check-in (espejo de `.choice-card` del
 * design-system): icono en burbuja, etiqueta humana y descripción. Se usa en
 * grid de 2 o 3 columnas para escalas graduables (flujo, coágulos, ánimo,
 * energía, estrés…). A diferencia de `SelectableCard` (layout horizontal de
 * lista), esta es vertical y densa para mostrar varias opciones por fila.
 */
export function ChoiceCard({ Icon, label, description, selected, onPress, testID }: Props) {
    const theme = useTheme();
    const styles = useChoiceCardStyles();

    return (
        <Pressable
            onPress={onPress}
            testID={testID}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
            style={[styles.card, selected && styles.cardOn]}
        >
            {Icon ? (
                <View style={[styles.iconBubble, selected && styles.iconBubbleOn]}>
                    <Icon
                        size={theme.sizing.iconXs}
                        color={selected ? theme.colors.onPrimary : theme.colors.link}
                        strokeWidth={2}
                    />
                </View>
            ) : null}
            <Text style={styles.label}>{label}</Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}
        </Pressable>
    );
}
