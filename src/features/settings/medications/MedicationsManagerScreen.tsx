import { ScrollView, Text } from "react-native";

import { useMedicationsManagerStyles } from "./MedicationsManagerStyle";

/** Configuración: catálogo personal de medicamentos (medication_catalog).   */
export default function MedicationsManagerScreen() {
    const styles = useMedicationsManagerStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Mis medicamentos"}</Text>
            <Text style={styles.description}>
                {"Añadir, renombrar o archivar medicamentos del catálogo personal. normalized_name evita duplicados."}
            </Text>
        </ScrollView>
    );
}
