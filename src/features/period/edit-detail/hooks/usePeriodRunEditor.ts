import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

import type { PeriodRun } from "@/db/schema/periodRun";
import { useDatabase } from "@/db/useDatabase";

import { deletePeriodRun } from "../../services/deletePeriodRun";
import { updatePeriodRun } from "../../services/updatePeriodRun";

export type PeriodRunEditorParams = {
    startDate: string;
    endDate: string | null;
    excluded: boolean;
};

/** Guardar/borrar una racha desde `period/edit/[id]` (plan 03, Fase 3). */
export function usePeriodRunEditor(profileId: string, run: PeriodRun) {
    const { t: tException } = useTranslation("exception");
    const { t } = useTranslation("period");
    const database = useDatabase();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function save(params: PeriodRunEditorParams) {
        if (isSubmitting) return;

        if (params.endDate !== null && params.endDate < params.startDate) {
            Alert.alert(t("edit.detail.rangeError"));
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await updatePeriodRun(database, {
                profileId,
                runId: run.id,
                previousStartDate: run.startDate,
                startDate: params.startDate,
                endDate: params.endDate,
                excluded: params.excluded,
            });

            if (!result.ok) {
                Alert.alert(t("edit.detail.overlapError"));
                return;
            }

            router.back();
        } catch {
            Alert.alert(tException("period.mutation"));
        } finally {
            setIsSubmitting(false);
        }
    }

    function confirmDelete() {
        Alert.alert(t("edit.detail.deleteConfirmTitle"), t("edit.detail.deleteConfirmBody"), [
            { text: t("edit.detail.cancel"), style: "cancel" },
            {
                text: t("edit.detail.deleteConfirmAction"),
                style: "destructive",
                onPress: async () => {
                    setIsSubmitting(true);
                    try {
                        await deletePeriodRun(database, { profileId, runId: run.id, runStartDate: run.startDate });
                        router.back();
                    } catch {
                        Alert.alert(tException("period.mutation"));
                    } finally {
                        setIsSubmitting(false);
                    }
                },
            },
        ]);
    }

    return { isSubmitting, save, confirmDelete };
}
