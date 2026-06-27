import { ScrollView, Text } from "react-native";

import { useAboutStyles } from "./AboutStyle";

/** Configuración: acerca de Rea + disclaimer. Ver README. */
export default function AboutScreen() {
    const styles = useAboutStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Acerca de Rea"}</Text>
            <Text style={styles.description}>
                {
                    "Disclaimer (Rea no diagnostica ni es método anticonceptivo), versión de la app y enfoque de privacidad."
                }
            </Text>
        </ScrollView>
    );
}
