import { useMemo, useState } from "react";

import { toIsoDate } from "@/modules/cycle/utils/cycleDate.utils";
import createDefaultNotificationCadence from "@/modules/notifications/defaults/createDefaultNotificationCadence";
import { Regularity } from "@/types/settings.types";
import { OnboardingFlowConfig } from "../onboarding.types";

/** Controla pasos, valores y guardado final del onboarding. */
export default function useOnboardingFlow({ onComplete }: OnboardingFlowConfig) {
    const [step, setStep] = useState(0);
    const [tryingToConceive, setTryingToConceive] = useState(false);
    const [lastPeriodStart, setLastPeriodStart] = useState(toIsoDate(new Date()));
    const [cycleLength, setCycleLength] = useState(28);
    const [periodLength, setPeriodLength] = useState(5);
    const [regularity, setRegularity] = useState<Regularity>("regular");
    const [hormonalContraception, setHormonalContraception] = useState(false);
    const [notificationCadence, setNotificationCadence] = useState(createDefaultNotificationCadence());
    const [saving, setSaving] = useState(false);

    const progress = useMemo(() => (step + 1) / 6, [step]);
    const finish = async () => {
        const now = new Date().toISOString();
        setSaving(true);
        try {
            await onComplete(
                {
                    onboarded: true,
                    lastPeriodStart,
                    cycleLength,
                    periodLength,
                    regularity,
                    hormonalContraception,
                    tryingToConceive,
                    createdAt: now,
                },
                notificationCadence,
            );
        } finally {
            setSaving(false);
        }
    };

    return {
        step,
        setStep,
        tryingToConceive,
        setTryingToConceive,
        lastPeriodStart,
        setLastPeriodStart,
        cycleLength,
        setCycleLength,
        periodLength,
        setPeriodLength,
        regularity,
        setRegularity,
        hormonalContraception,
        setHormonalContraception,
        notificationCadence,
        setNotificationCadence,
        saving,
        progress,
        finish,
    };
}
