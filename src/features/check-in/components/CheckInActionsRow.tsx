import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { colors } from "@/theme";
import { SoftButton } from "@/ui/SoftButton";
import styles from "../CheckInModal.styles";

interface CheckInActionsRowProps {
    canDeleteMoment: boolean;
    deleting: boolean;
    saving: boolean;
    isEditing: boolean;
    showDailyLogHelper: boolean;
    onDelete: () => void;
    onSave: () => void;
}

/** Muestra acciones finales del modal y ayudas de edición. */
export default function CheckInActionsRow({
    canDeleteMoment,
    deleting,
    saving,
    isEditing,
    showDailyLogHelper,
    onDelete,
    onSave,
}: CheckInActionsRowProps) {
    const { t } = useTranslation("checkIn");

    return (
        <>
            <View style={styles.actionsRow}>
                {canDeleteMoment ? (
                    <SoftButton
                        label={t("actions.deleteMoment")}
                        loading={deleting}
                        onPress={onDelete}
                        style={styles.deleteButton}
                        variant="ghost"
                        labelStyle={styles.deleteButtonLabel}
                        loadingColor={colors.period}
                    />
                ) : null}
                <SoftButton
                    label={isEditing ? t("actions.saveEditing") : t("actions.saveNew")}
                    loading={saving}
                    onPress={onSave}
                    style={[styles.saveButton, canDeleteMoment ? styles.saveButtonSplit : null]}
                />
            </View>
            {showDailyLogHelper ? <Text style={styles.helperText}>{t("helper.editDailyLog")}</Text> : null}
            <Text style={styles.privacy}>{t("helper.privacy")}</Text>
        </>
    );
}
