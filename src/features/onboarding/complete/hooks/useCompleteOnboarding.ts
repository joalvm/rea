import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

import { useDatabase } from "@/db/useDatabase";
import { notificationCopyResolver, requestNotificationPermission, reprogramAll } from "@/modules/notifications";
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

            // Permiso just-in-time: solo se pide si la usuaria activó los
            // recordatorios. Denegado se respeta sin insistir; el banner de
            // Ajustes ofrecerá re-intento. Tras completar, reprogramamos con
            // las preferencias recién persistidas.
            if (draft.remindersEnabled) {
                await requestNotificationPermission();
                await reprogramAll(database, { resolveCopy: notificationCopyResolver() }).catch(() => {
                    // La reprogramación es best-effort: si falla, los ajustes
                    // quedan guardados y se reintentará al abrir la app.
                });
            }

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
