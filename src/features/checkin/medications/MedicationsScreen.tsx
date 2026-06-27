import { Pressable, ScrollView, Text } from "react-native";

import { useMedicationsStyles } from "./MedicationsStyle";

type Props = {
    onContinue: () => void;
};

/** Check-in paso 6: medicamentos tomados → checkin_medications. Ver README. */
export default function MedicationsScreen({ onContinue }: Props) {
    const styles = useMedicationsStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Medicamentos"}</Text>
            <Text style={styles.description}>
                {
                    "Qué tomaste (catálogo personal) + nota de dosis. El alivio (0-2) es opcional: se puede completar después."
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
