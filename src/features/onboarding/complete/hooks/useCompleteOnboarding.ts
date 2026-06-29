import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

import { useDatabase } from "@/db/useDatabase";
import { useOnboardingStore } from "../../shared/stores/useOnboardingStore";

import { completeOnboarding } from "../services/completeOnboarding";

export function useCompleteOnboarding() {
    const { t } = useTranslation("exception");
    const database = useDatabase();
    const draft = useOnboardingStore((state) => state.draft);
    const reset = useOnboardingStore((state) => state.reset);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function submitCompleteOnboarding(): Promise<boolean> {
        if (isSubmitting) {
            return false;
        }

        setIsSubmitting(true);

        try {
            await completeOnboarding(database, draft);
            reset();
            return true;
        } catch {
            Alert.alert(t("onboarding.complete"));
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }

    return {
        submitCompleteOnboarding,
        isSubmitting,
    };
}
