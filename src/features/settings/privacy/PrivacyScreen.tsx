import { ScrollView, Text } from "react-native";

import { usePrivacyStyles } from "./PrivacyStyle";

/** Configuración: centro de privacidad (export/import/borrar/bloqueo). Ver README. */
export default function PrivacyScreen() {
    const styles = usePrivacyStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Privacidad"}</Text>
            <Text style={styles.description}>
                {
                    "Exportar / importar / borrar todos los datos y bloqueo con PIN o biometría. Rea es local-first: nada sale del dispositivo."
                }
            </Text>
        </ScrollView>
    );
}
