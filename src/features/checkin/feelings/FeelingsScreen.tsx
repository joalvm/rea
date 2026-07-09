import { Pressable, ScrollView, Text } from "react-native";

import { useFeelingsStyles } from "./FeelingsStyle";

type Props = {
    onContinue: () => void;
};

/** Check-in paso 2: estado emocional.   */
export default function FeelingsScreen({ onContinue }: Props) {
    const styles = useFeelingsStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"¿Cómo estás de ánimo?"}</Text>
            <Text style={styles.description}>
                {"Ánimo (1-5), energía (1-5) y estrés (0-5). Escalas suaves, no examen clínico."}
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
