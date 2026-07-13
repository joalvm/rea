import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

import { useLocalProfile } from "@/domain/hooks/useLocalProfile";
import { useDatabase } from "@/db/useDatabase";

import { hasCheckinContent } from "../types/CheckinDraft";
import { useCheckinStore } from "../stores/useCheckinStore";
import { createCheckin } from "../services/createCheckin";
import { logCheckinSummary } from "../dev/checkinMetrics";

/**
 * Hook de guardado del check-in. Lee el borrador del store efímero, valida que
 * haya contenido que persistir, ejecuta la mutación transaccional y, al
 * success, resetea el borrador. Expone `isSubmitting` para deshabilitar el CTA
 * durante el guardado y `isEmpty` cuando el borrador no tiene nada que guardar.
 */
export function useCompleteCheckin() {
    const { t } = useTranslation("exception");
    const database = useDatabase();
    const { profile } = useLocalProfile();
    const draft = useCheckinStore((state) => state.draft);
    const reset = useCheckinStore((state) => state.reset);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isEmpty = !hasCheckinContent(draft);

    async function submit(): Promise<boolean> {
        if (isSubmitting) {
            return false;
        }
        if (isEmpty) {
            return true;
        }
        if (!profile) {
            return false;
        }

        setIsSubmitting(true);

        try {
            await createCheckin(database, { profileId: profile.id, draft });
            logCheckinSummary();
            reset();
            return true;
        } catch {
            Alert.alert(t("checkin.save"));
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }

    return {
        submit,
        isSubmitting,
        isEmpty,
    };
}
