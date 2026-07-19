import { View } from "react-native";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/theme/useTheme";

import { useStepDotsStyles } from "./StepDotsStyle";

type Props = {
    count: number;
    index: number;
    accent?: string;
    testID?: string;
};

/**
 * Indicador tipo carrusel: una fila de puntos flotando sobre el CTA. El paso
 * actual es una píldora celeste alargada; el resto, puntos suaves. Reemplaza a
 * la antigua barra de progreso + contador "x / n" (se sentía formulario).
 */
export function StepDots({ count, index, accent, testID }: Props) {
    const { t } = useTranslation("onboarding");
    const theme = useTheme();
    const styles = useStepDotsStyles();
    const onColor = accent ?? theme.colors.primary;

    return (
        <View
            accessibilityLabel={t("progress.label", { current: index + 1, total: count })}
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 1, max: count, now: index + 1 }}
            style={styles.row}
            testID={testID}
        >
            {Array.from({ length: count }, (_, i) => {
                const active = i === index;
                return (
                    <View
                        key={i}
                        style={[styles.dot, active && styles.dotActive, active && { backgroundColor: onColor }]}
                    />
                );
            })}
        </View>
    );
}
