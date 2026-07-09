import { ScrollView, Text } from "react-native";

import { useTipsStyles } from "./TipsStyle";

/** Segmento de Estadísticas: biblioteca de contenido educativo. Ver README de la feature. */
export default function TipsScreen() {
    const styles = useTipsStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Tips"}</Text>
            <Text style={styles.description}>
                {
                    "Biblioteca de contenido educativo por tema, cada pieza con su fuente revisada. Vive como segmento dentro de Estadísticas."
                }
            </Text>
        </ScrollView>
    );
}
