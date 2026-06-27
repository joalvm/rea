import { ScrollView, Text } from "react-native";

import { usePeriodEditStyles } from "./PeriodEditStyle";

/** Edición de un periodo (period_runs): fechas, excluir, marcar spotting. Ver README. */
export default function PeriodEditScreen() {
    const styles = usePeriodEditStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Editar periodo"}</Text>
            <Text style={styles.description}>
                {
                    "Cambiar fecha de inicio/fin, marcar como manchado (no periodo) o excluir el episodio. Usa status y source de period_runs."
                }
            </Text>
        </ScrollView>
    );
}
