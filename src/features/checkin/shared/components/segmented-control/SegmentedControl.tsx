import type { LucideIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { useTheme } from "@/theme/useTheme";

import { useSegmentedControlStyles } from "./SegmentedControlStyle";

export type SegmentedOption<T extends string | number> = {
    value: T;
    label: string;
    Icon?: LucideIcon;
};

type Props<T extends string | number> = {
    options: readonly SegmentedOption<T>[];
    value: T | null;
    onChange: (value: T | null) => void;
    testID?: string;
};

/**
 * Control segmentado del check-in (espejo de `.seg` del design-system): fondo
 * `primarySubtle`, segmento activo = superficie blanca con sombra-susurro. Cada
 * opción lleva icono encima + etiqueta (layout vertical), en línea con la regla
 * de identidad por icono. Tocar el valor activo lo deselecciona (toggle → null).
 */
export function SegmentedControl<T extends string | number>({ options, value, onChange, testID }: Props<T>) {
    const theme = useTheme();
    const styles = useSegmentedControlStyles();

    return (
        <View style={styles.container} testID={testID}>
            {options.map((option) => {
                const active = option.value === value;
                const Icon = option.Icon;
                return (
                    <Pressable
                        key={String(option.value)}
                        onPress={() => onChange(active ? null : option.value)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={option.label}
                        style={[styles.item, active && styles.itemOn]}
                    >
                        {Icon ? (
                            <Icon
                                size={theme.sizing.iconSm}
                                color={active ? theme.colors.primary : theme.colors.textMuted}
                                strokeWidth={2.2}
                            />
                        ) : null}
                        <Text style={[styles.itemText, active && styles.itemTextOn]}>{option.label}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
