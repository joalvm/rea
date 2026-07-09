import { ScrollView, Text } from "react-native";

import { useSourcesStyles } from "./SourcesStyle";

/** Configuración: fuentes revisadas del contenido (content_sources).   */
export default function SourcesScreen() {
    const styles = useSourcesStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Fuentes revisadas"}</Text>
            <Text style={styles.description}>
                {
                    "Listado de fuentes del contenido educativo: tipo (guía médica, salud pública, revisado por pares…), referencia y fecha de revisión."
                }
            </Text>
        </ScrollView>
    );
}
