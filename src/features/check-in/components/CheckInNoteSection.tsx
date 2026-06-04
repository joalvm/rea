import { Text, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

import { colors } from "@/theme";
import styles from "../CheckInModal.styles";

interface CheckInNoteSectionProps {
    note: string;
    onChangeNote: (value: string) => void;
}

/** Renderiza campo libre para notas del día o del momento. */
export default function CheckInNoteSection({ note, onChangeNote }: CheckInNoteSectionProps) {
    const { t } = useTranslation("checkIn");

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("note.title")}</Text>
            <TextInput
                multiline
                onChangeText={onChangeNote}
                placeholder={t("note.placeholder")}
                placeholderTextColor={colors.muted}
                style={styles.input}
                value={note}
            />
        </View>
    );
}
