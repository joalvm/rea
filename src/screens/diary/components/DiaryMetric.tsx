import { Text, View } from "react-native";

import styles from "../DiaryScreen.styles";

/** Props de una métrica compacta en filas del diario. */
interface DiaryMetricProps {
    label: string;
    value: number;
}

/** Muestra una métrica puntual del check-in en formato compacto. */
export default function DiaryMetric({ label, value }: DiaryMetricProps) {
    return (
        <View style={styles.metric}>
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={styles.metricValue}>{value}/5</Text>
        </View>
    );
}
