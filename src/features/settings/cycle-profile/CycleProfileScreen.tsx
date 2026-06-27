import { ScrollView, Text } from "react-native";

import { useCycleProfileStyles } from "./CycleProfileStyle";

/** Configuración: contexto reproductivo versionado (reproductive_intent_history). Ver README. */
export default function CycleProfileScreen() {
    const styles = useCycleProfileStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Mi contexto"}</Text>
            <Text style={styles.description}>
                {
                    "Regularidad, duración de ciclo/periodo, anticoncepción y búsqueda de embarazo. Editar crea una NUEVA versión, no sobrescribe."
                }
            </Text>
        </ScrollView>
    );
}
