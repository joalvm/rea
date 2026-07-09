import { ScrollView, Text } from "react-native";

import { usePregnancyStyles } from "./PregnancyStyle";

/** Configuración: modo embarazo (pregnancy_episodes). Pausa predicciones.   */
export default function PregnancyScreen() {
    const styles = usePregnancyStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Modo embarazo"}</Text>
            <Text style={styles.description}>
                {
                    "Registrar inicio/fin de un embarazo (pregnancy_episodes). Rea pausa las predicciones de ciclo; el diario sigue disponible."
                }
            </Text>
        </ScrollView>
    );
}
