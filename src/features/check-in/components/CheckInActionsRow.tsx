import { Text, View } from "react-native";

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
    return (
        <>
            <View style={styles.actionsRow}>
                {canDeleteMoment ? (
                    <SoftButton
                        label="Eliminar momento"
                        loading={deleting}
                        onPress={onDelete}
                        style={styles.deleteButton}
                        variant="ghost"
                        labelStyle={styles.deleteButtonLabel}
                        loadingColor={colors.period}
                    />
                ) : null}
                <SoftButton
                    label={isEditing ? "Actualizar" : "Guardar"}
                    loading={saving}
                    onPress={onSave}
                    style={[styles.saveButton, canDeleteMoment ? styles.saveButtonSplit : null]}
                />
            </View>
            {showDailyLogHelper ? (
                <Text style={styles.helperText}>
                    Para quitar algo de este día, desmárcalo o borra su nota. Día completo no se elimina.
                </Text>
            ) : null}
            <Text style={styles.privacy}>Se queda solo en este teléfono.</Text>
        </>
    );
}
