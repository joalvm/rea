import { ScrollView, Text } from "react-native";

import { usePeriodConfirmStyles } from "./PeriodConfirmStyle";

/** Confirmación de periodo inferido por sangrado (source bleeding_inferred).   */
export default function PeriodConfirmScreen() {
    const styles = usePeriodConfirmStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"¿Fue tu periodo?"}</Text>
            <Text style={styles.description}>
                {
                    "Rea detectó sangrado varios días. Confirmar como periodo (source → user_confirmed), marcar como manchado o no contar."
                }
            </Text>
        </ScrollView>
    );
}
