import { ScrollView, Text } from "react-native";

import { useDiaryStyles } from "./DiaryStyle";

/** Tab Diario: timeline de check-ins del día + resumen + mini-gráficos.   */
export default function DiaryScreen() {
    const styles = useDiaryStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Diario"}</Text>
            <Text style={styles.description}>
                {
                    "Los check-ins del día como timeline (editar · eliminar · no contar en estadísticas), resumen emocional del día y mini-gráficos. Tono de diario íntimo."
                }
            </Text>
        </ScrollView>
    );
}
