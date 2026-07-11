import type { LucideIcon } from "lucide-react-native";
import { Check } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { useTheme } from "@/theme/useTheme";

import { useMultiChipStyles } from "./MultiChipStyle";

type Props = {
    Icon?: LucideIcon;
    label: string;
    /** Nivel de intensidad opcional (1–5) que se muestra como puntos. */
    level?: number;
    selected: boolean;
    onPress: () => void;
    testID?: string;
};

/**
 * Chip multi-selección del check-in (espejo de `.schip` del design-system). Se
 * usa en el paso de síntomas: tap para marcar/desmarcar, y opcionalmente
 * muestra puntos de intensidad cuando `level` está definido.
 */
export function MultiChip({ Icon, label, level, selected, onPress, testID }: Props) {
    const theme = useTheme();
    const styles = useMultiChipStyles();

    return (
        <Pressable
            onPress={onPress}
            testID={testID}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
            style={[styles.chip, selected && styles.chipOn]}
        >
            {selected ? (
                <View style={styles.checkDot}>
                    <Check size={12} color={theme.colors.onPrimary} strokeWidth={3} />
                </View>
            ) : Icon ? (
                <View style={styles.iconWrap}>
                    <Icon size={theme.sizing.iconSm} color={theme.colors.link} strokeWidth={2.2} />
                </View>
            ) : null}
            <Text style={[styles.label, selected && styles.labelOn]}>{label}</Text>
            {typeof level === "number" && level > 0 && selected ? (
                <View style={styles.dots}>
                    {Array.from({ length: 5 }, (_, i) => (
                        <View key={i} style={[styles.dot, i < level && styles.dotOn]} />
                    ))}
                </View>
            ) : null}
        </Pressable>
    );
}
