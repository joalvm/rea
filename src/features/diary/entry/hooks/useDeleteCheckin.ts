import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Alert } from "react-native";

import { useDatabase } from "@/db/useDatabase";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { useFeedbackStore } from "@/shared/feedback/useFeedbackStore";

import { deleteCheckin } from "../services/deleteCheckin";
import { restoreCheckin } from "../services/restoreCheckin";

export type UseDeleteCheckinResult = {
    /** Pide confirmación y, al aceptar, borra + muestra snackbar con deshacer. */
    confirmAndRemove: (checkinId: string) => void;
    isRemoving: boolean;
};

/**
 * Orquesta el borrado de un registro desde el detalle del diario:
 * 1. `Alert.alert` con confirmación (cancel + destructiva).
 * 2. Al confirmar: `deleteCheckin` + `onChanged()` (recarga la lista).
 * 3. Snackbar con acción "Deshacer" → `restoreCheckin` + `onChanged()`.
 *
 * `onChanged` típicamente es el `reload()` de `useCheckinsOfDay`.
 */
export function useDeleteCheckin(onChanged: () => void): UseDeleteCheckinResult {
    const { t: tDiary } = useTranslation("diary");
    const { t: tCommon } = useTranslation("common");
    const database = useDatabase();
    const { profile } = useLocalProfile();
    const showFeedback = useFeedbackStore((s) => s.show);
    const [isRemoving, setIsRemoving] = useState(false);

    function confirmAndRemove(checkinId: string) {
        if (!profile) return;
        Alert.alert(
            tDiary("detail.deleteConfirmTitle"),
            tDiary("detail.deleteConfirmBody"),
            [
                { text: tDiary("detail.cancel"), style: "cancel" },
                {
                    text: tDiary("detail.deleteConfirmAction"),
                    style: "destructive",
                    onPress: async () => {
                        setIsRemoving(true);
                        try {
                            await deleteCheckin(database, { profileId: profile.id, checkinId });
                            onChanged();
                            showFeedback({
                                message: tDiary("detail.deleted"),
                                action: {
                                    label: tCommon("feedback.undo"),
                                    onPress: async () => {
                                        await restoreCheckin(database, { profileId: profile.id, checkinId });
                                        onChanged();
                                    },
                                },
                                durationMs: 6000,
                            });
                        } catch {
                            Alert.alert(tCommon("feedback.error"));
                        } finally {
                            setIsRemoving(false);
                        }
                    },
                },
            ],
        );
    }

    return { confirmAndRemove, isRemoving };
}
