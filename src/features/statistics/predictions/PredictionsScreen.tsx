import { ScrollView, Text } from "react-native";

import { usePredictionsStyles } from "./PredictionsStyle";

/** Segmento de Estadísticas: predicciones con confianza. Ver README de la feature. */
export default function PredictionsScreen() {
    const styles = usePredictionsStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Predicciones"}</Text>
            <Text style={styles.description}>
                {
                    "Próxima regla y ventana fértil/ovulación con nivel de confianza y disclaimer. Vive como segmento dentro de Estadísticas."
                }
            </Text>
        </ScrollView>
    );
}
