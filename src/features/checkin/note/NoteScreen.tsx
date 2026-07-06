import { Pressable, ScrollView, Text } from "react-native";

import { useNoteStyles } from "./NoteStyle";

type Props = {
    onContinue: () => void;
};

/** Check-in paso 7: nota libre (checkins.note).   */
export default function NoteScreen({ onContinue }: Props) {
    const styles = useNoteStyles();

    return (
        <ScrollView style={styles.screen} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{"Una nota para hoy"}</Text>
            <Text style={styles.description}>
                {"Algo que quieras recordar de este momento. Opcional y en tono de diario."}
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
