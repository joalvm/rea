import { Text, View } from "react-native";

import { useStatisticsStyles } from "./StatisticsStyle";

type Props = {
    title: string;
    value: string;
    footer: string;
};

/** Tarjeta de una métrica estadística con título, valor y contexto de confianza. */
export function StatisticsMetricCard({ title, value, footer }: Props) {
    const styles = useStatisticsStyles();

    return (
        <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>{title}</Text>
            <Text style={styles.metricValue}>{value}</Text>
            <Text style={styles.metricFooter}>{footer}</Text>
        </View>
    );
}
