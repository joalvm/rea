import { DimensionValue, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import styles from "../StatisticsScreen.styles";

/** Props de una barra de promedio reciente. */
interface MetricBarProps {
    label: string;
    value: number;
    color: string;
    maxValue?: number;
    valueLabel?: string;
}

/** Renderiza una barra horizontal con promedio reciente. */
export default function MetricBar({ label, value, color, maxValue = 5, valueLabel }: MetricBarProps) {
    const { t } = useTranslation("statistics");
    const width = `${Math.min(100, Math.max(4, (value / maxValue) * 100))}%` as DimensionValue;

    return (
        <View style={styles.barRow}>
            <View style={styles.barHeader}>
                <Text style={styles.barLabel}>{label}</Text>
                <Text style={styles.barValue}>
                    {valueLabel ?? t("metrics.score", { value: value ? value.toFixed(1) : "0.0" })}
                </Text>
            </View>
            <View style={styles.barTrack}>
                <View style={[styles.barFill, { width, backgroundColor: color }]} />
            </View>
        </View>
    );
}
