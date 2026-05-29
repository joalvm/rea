import { Text, View } from "react-native";

import styles from "../PatternsScreen.styles";
import { MetricPillProps } from "../patterns.types";

/** Resume una métrica corta del ciclo en formato pill. */
export default function MetricPill({ label, tone }: MetricPillProps) {
    return (
        <View style={[styles.metricPill, tone === "watch" && styles.metricPillWatch]}>
            <Text style={[styles.metricPillText, tone === "watch" && styles.metricPillTextWatch]}>{label}</Text>
        </View>
    );
}
