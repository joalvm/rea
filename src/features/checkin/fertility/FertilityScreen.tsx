import { Pressable, ScrollView, Text } from "react-native";

import { useFertilityStyles } from "./FertilityStyle";

type Props = {
    onContinue: () => void;
};

/**
 * Check-in paso 5 (CONDICIONAL): fertilidad y sexualidad.
 * Solo si trying_to_conceive y sin anticoncepción hormonal. Ver README.
 */
export default function FertilityScreen({ onContinue }: Props) {
    const styles = useFertilityStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Fertilidad"}</Text>
            <Text style={styles.description}>
                {
                    "Moco cervical (0-4), libido (0-4) y registrar relación (intercourse_log). Copy de señales, nunca de certeza."
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
