import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

import { useDatabase } from "@/db/useDatabase";
import type { PeriodProposal } from "@/domain/hooks/usePeriodProposal";

import { closePeriodRun } from "../../services/closePeriodRun";
import { mergePeriodRuns } from "../../services/mergePeriodRuns";
import { startPeriodRun } from "../../services/startPeriodRun";

/** Acciones disponibles en `period/confirm`, una por cada rama de `ReconciliationAction`. */
export function useConfirmPeriodProposal(profileId: string, proposal: PeriodProposal) {
    const { t } = useTranslation("exception");
    const database = useDatabase();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function run(action: () => Promise<unknown>) {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            await action();
            router.back();
        } catch {
            Alert.alert(t("period.mutation"));
        } finally {
            setIsSubmitting(false);
        }
    }

    return {
        isSubmitting,
        dismiss: () => router.back(),
        confirmStart: (startDate: string) =>
            run(() => startPeriodRun(database, { profileId, startDate, status: "open", source: "bleeding_inferred" })),
        markSpotting: (startDate: string) =>
            run(() =>
                startPeriodRun(database, {
                    profileId,
                    startDate,
                    endDate: startDate,
                    status: "excluded",
                    source: "user_confirmed",
                }),
            ),
        confirmClose: (endDate: string) => {
            const openRun = proposal.openRun;
            if (!openRun) return;
            return run(() =>
                closePeriodRun(database, { profileId, runId: openRun.id, runStartDate: openRun.startDate, endDate }),
            );
        },
        confirmMerge: () => {
            const mergeCandidateRun = proposal.mergeCandidateRun;
            if (!mergeCandidateRun) return;
            return run(() =>
                mergePeriodRuns(database, {
                    profileId,
                    runId: mergeCandidateRun.id,
                    runStartDate: mergeCandidateRun.startDate,
                }),
            );
        },
        declineMerge: (newStartDate: string) =>
            run(() =>
                startPeriodRun(database, {
                    profileId,
                    startDate: newStartDate,
                    status: "open",
                    source: "bleeding_inferred",
                }),
            ),
    };
}
