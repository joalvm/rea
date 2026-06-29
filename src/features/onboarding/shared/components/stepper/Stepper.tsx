import { Minus, Plus } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/theme/useTheme";

import { useStepperStyles } from "./StepperStyle";

type Props = {
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    onChange: (value: number) => void;
    testID?: string;
};

export function Stepper({ value, min, max, step = 1, unit, onChange, testID }: Props) {
    const { t } = useTranslation("common");
    const theme = useTheme();
    const styles = useStepperStyles();

    const clamp = (next: number) => Math.max(min, Math.min(max, next));

    return (
        <View style={styles.container} testID={testID}>
            <Pressable
                onPress={() => onChange(clamp(value - step))}
                disabled={value <= min}
                accessibilityRole="button"
                accessibilityLabel={t("accessibility.decrease")}
                accessibilityState={{ disabled: value <= min }}
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                    value <= min && styles.buttonDisabled,
                ]}
            >
                <Minus size={20} color={theme.colors.link} strokeWidth={2.4} />
            </Pressable>
            <View style={styles.valueWrap}>
                <Text style={styles.value}>{value}</Text>
                {unit ? <Text style={styles.unit}>{unit}</Text> : null}
            </View>
            <Pressable
                onPress={() => onChange(clamp(value + step))}
                disabled={value >= max}
                accessibilityRole="button"
                accessibilityLabel={t("accessibility.increase")}
                accessibilityState={{ disabled: value >= max }}
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                    value >= max && styles.buttonDisabled,
                ]}
            >
                <Plus size={20} color={theme.colors.link} strokeWidth={2.4} />
            </Pressable>
        </View>
    );
}
