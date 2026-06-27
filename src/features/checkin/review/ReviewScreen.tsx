import { Pressable, ScrollView, Text } from "react-native";

import { useReviewStyles } from "./ReviewStyle";

type Props = {
    onSave: () => void;
};

/**
 * Check-in paso final: resumen y guardado.
 * Al guardar persiste el check-in (+ síntomas, medicación, relación) y dispara
 * el recálculo de daily_summary del día. Ver README de la feature.
 */
export default function ReviewScreen({ onSave }: Props) {
    const styles = useReviewStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Revisa tu registro"}</Text>
            <Text style={styles.description}>
                {
                    "Resumen de sangrado, estado, síntomas, medicación y nota. Al guardar, Rea recalcula el resumen del día."
                }
            </Text>

            <Pressable
                style={({ pressed }) => [styles.button, styles.primary, pressed && styles.pressed]}
                onPress={onSave}
            >
                <Text style={styles.primaryText}>{"Guardar mi registro"}</Text>
            </Pressable>
        </ScrollView>
    );
}
