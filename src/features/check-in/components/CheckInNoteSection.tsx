import { Text, TextInput, View } from "react-native";

import { colors } from "../../../theme";
import styles from "../CheckInModal.styles";

interface CheckInNoteSectionProps {
    note: string;
    onChangeNote: (value: string) => void;
}

/** Renderiza campo libre para notas del día o del momento. */
export default function CheckInNoteSection({ note, onChangeNote }: CheckInNoteSectionProps) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nota opcional</Text>
            <TextInput
                multiline
                onChangeText={onChangeNote}
                placeholder="Algo que quieras recordar..."
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={note}
            />
        </View>
    );
}
