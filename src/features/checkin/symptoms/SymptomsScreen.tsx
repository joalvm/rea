import { Pressable, ScrollView, Text } from "react-native";

import { useSymptomsStyles } from "./SymptomsStyle";

type Props = {
    onContinue: () => void;
};

/** Check-in paso 4: síntomas del catálogo con intensidad → checkin_symptoms. Ver README. */
export default function SymptomsScreen({ onContinue }: Props) {
    const styles = useSymptomsStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Síntomas"}</Text>
            <Text style={styles.description}>
                {"Catálogo agrupado; primero los de acceso rápido. Al elegir uno, se pide su intensidad (1-5)."}
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
