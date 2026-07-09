import { ScrollView, Text } from "react-native";

import { useCalendarStyles } from "./CalendarStyle";

/** Tab Calendario: rejilla mensual desde daily_summary. Ver README de la feature. */
export default function CalendarScreen() {
    const styles = useCalendarStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Calendario"}</Text>
            <Text style={styles.description}>
                {
                    "Rejilla mensual desde daily_summary: color por fase y menstruación, marcadores discretos (medicación, relación, síntoma) y overlay de predicción. Tocar un día abre su detalle."
                }
            </Text>
        </ScrollView>
    );
}
