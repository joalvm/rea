import { ScrollView, Text } from "react-native";

import { useSettingsNotificationsStyles } from "./SettingsNotificationsStyle";

/** Configuración: recordatorios (user_profile.reminder_*). Ver README. */
export default function SettingsNotificationsScreen() {
    const styles = useSettingsNotificationsStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Recordatorios"}</Text>
            <Text style={styles.description}>
                {
                    "Activar/desactivar, ventana horaria, intervalo y tipo de recordatorio (check-in suave, periodo, medicación pendiente)."
                }
            </Text>
        </ScrollView>
    );
}
