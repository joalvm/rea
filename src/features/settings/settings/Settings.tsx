import { Text, View } from "react-native";

import { styles } from "./SettingsStyle";

export default function Settings() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Vista de Configuración</Text>
            <Text style={styles.subtitle}>settings/settings.tsx</Text>
            <Text style={styles.description}>Ajustes de la aplicación, preferencias del usuario, etc.</Text>
        </View>
    );
}
