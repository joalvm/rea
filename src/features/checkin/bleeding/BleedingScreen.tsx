import { Pressable, ScrollView, Text } from "react-native";

import { useBleedingStyles } from "./BleedingStyle";

type Props = {
    onContinue: () => void;
};

/** Check-in paso 1: sangrado y periodo. Puede crear/actualizar period_runs. Ver README. */
export default function BleedingScreen({ onContinue }: Props) {
    const styles = useBleedingStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Sangrado"}</Text>
            <Text style={styles.description}>
                {
                    "Intensidad (0-4), coágulos (0-3) y señal de periodo (empezó · sigue · terminó). Alimenta checkins y period_runs."
                }
            </Text>

            <Pressable
                style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
                onPress={onContinue}
            >
                <Text style={styles.primaryText}>{"Continuar"}</Text>
            </Pressable>
        </ScrollView>
    );
}
