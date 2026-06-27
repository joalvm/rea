import { Pressable, ScrollView, Text } from "react-native";

import { useCheckinIntroStyles } from "./CheckinIntroStyle";

type Props = {
    onContinue: () => void;
};

/** Check-in (entrada): elige modo rápido o completo. Ver README de la feature. */
export default function CheckinIntroScreen({ onContinue }: Props) {
    const styles = useCheckinIntroStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"¿Cómo te sientes ahora?"}</Text>
            <Text style={styles.description}>
                {
                    "Modo rápido (lo esencial) o completo. Puedes registrar varios check-ins al día. Toma menos de 1 minuto."
                }
            </Text>

            <Pressable
                style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
                onPress={onContinue}
            >
                <Text style={styles.primaryText}>{"Empezar check-in"}</Text>
            </Pressable>
        </ScrollView>
    );
}
