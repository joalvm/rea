import { ScrollView, Text } from "react-native";

import { useStatisticsStyles } from "./StatisticsStyle";

/** Tab Estadísticas (segmentada): resumen del ciclo, fases, síntomas, etc. Ver README. */
export default function StatisticsScreen() {
    const styles = useStatisticsStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Estadísticas"}</Text>
            <Text style={styles.description}>
                {
                    "Segmentada: Ciclo · Fases · Síntomas · Ánimo/energía/estrés · Medicación · Señales para consultar. Insights honestos, no gráficos por gráficos."
                }
            </Text>
        </ScrollView>
    );
}
