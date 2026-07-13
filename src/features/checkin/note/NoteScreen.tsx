import { FileText } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { TextInput, View } from "react-native";

import { useTheme } from "@/theme/useTheme";
import { CheckinHeader } from "@/features/checkin/shared/components/checkin-screen/CheckinHeader";
import { CheckinScreen } from "@/features/checkin/shared/components/checkin-screen/CheckinScreen";
import { CheckinSaveButton } from "@/features/checkin/shared/components/checkin-screen/CheckinSaveButton";
import { useCheckinScreenStyles } from "@/features/checkin/shared/components/checkin-screen/CheckinScreenStyle";
import { useCheckinStepMetric } from "@/features/checkin/shared/dev/useCheckinStepMetric";
import { PrimaryButton } from "@/components/primary-button/PrimaryButton";
import { useNoteStyles } from "./NoteStyle";

import { useCheckinStore } from "../shared/stores/useCheckinStore";

type Props = {
    onContinue: () => void;
    onSaved: () => void;
};

/** Check-in paso 7: nota libre (checkins.note). */
export default function NoteScreen({ onContinue, onSaved }: Props) {
    const { t: tCheckin } = useTranslation("checkIn");
    const { t: tCommon } = useTranslation("common");
    useCheckinStepMetric("note");
    const theme = useTheme();
    const styles = useNoteStyles();
    const screenStyles = useCheckinScreenStyles();
    const note = useCheckinStore((state) => state.draft.note);
    const set = useCheckinStore((state) => state.set);

    return (
        <CheckinScreen>
            <CheckinHeader Icon={FileText} title={tCheckin("note.title")} lead={tCheckin("note.hint")} />

            <TextInput
                style={styles.input}
                value={note ?? ""}
                onChangeText={(text) => set({ note: text.length > 0 ? text : null })}
                placeholder={tCheckin("note.placeholder")}
                placeholderTextColor={theme.colors.placeholder}
                multiline
                textAlignVertical="top"
            />

            <View style={screenStyles.footer}>
                <PrimaryButton label={tCommon("action.continue")} onPress={onContinue} />
                <CheckinSaveButton onSaved={onSaved} />
            </View>
        </CheckinScreen>
    );
}
