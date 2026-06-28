import { Pressable, Text, View } from "react-native";

import { useSegmentedControlStyles } from "./SegmentedControlStyle";

type Option<T extends string | number | boolean> = {
    value: T;
    label: string;
};

type Props<T extends string | number | boolean> = {
    options: readonly Option<T>[];
    value: T;
    onChange: (value: T) => void;
    testID?: string;
};

export function SegmentedControl<T extends string | number | boolean>({ options, value, onChange, testID }: Props<T>) {
    const styles = useSegmentedControlStyles();

    return (
        <View style={styles.container} testID={testID}>
            {options.map((option) => {
                const active = option.value === value;
                return (
                    <Pressable
                        key={String(option.value)}
                        onPress={() => onChange(option.value)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        accessibilityLabel={option.label}
                        style={[styles.item, active && styles.itemOn]}
                    >
                        <Text style={[styles.itemText, active && styles.itemTextOn]}>{option.label}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
