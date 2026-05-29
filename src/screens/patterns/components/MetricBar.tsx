import { DimensionValue, Text, View } from "react-native";

import styles from "../PatternsScreen.styles";

/** Props de una barra de promedio reciente. */
interface MetricBarProps {
    label: string;
    value: number;
    color: string;
}

/** Renderiza una barra horizontal con promedio reciente. */
export default function MetricBar({ label, value, color }: MetricBarProps) {
    const width = `${Math.min(100, Math.max(4, (value / 5) * 100))}%` as DimensionValue;

    return (
        <View style={styles.barRow}>
            <View style={styles.barHeader}>
                <Text style={styles.barLabel}>{label}</Text>
                <Text style={styles.barValue}>{value ? value.toFixed(1) : "0.0"}/5</Text>
            </View>
            <View style={styles.barTrack}>
                <View style={[styles.barFill, { width, backgroundColor: color }]} />
            </View>
        </View>
    );
}
