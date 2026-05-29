import { useMemo, useState } from "react";

import { toIsoDate } from "../../../modules/cycle/shared/cycleDate.utils";
import createDefaultNotificationMoments from "../../../modules/notifications/defaults/createDefaultNotificationMoments";
import { Goal, Regularity } from "../../../types/settings.types";
import { OnboardingFlowConfig } from "../onboarding.types";

/** Controla pasos, valores y guardado final del onboarding. */
export default function useOnboardingFlow({ onComplete }: OnboardingFlowConfig) {
    const [step, setStep] = useState(0);
    const [goal, setGoal] = useState<Goal>("self_knowledge");
    const [lastPeriodStart, setLastPeriodStart] = useState(toIsoDate(new Date()));
    const [cycleLength, setCycleLength] = useState(28);
    const [periodLength, setPeriodLength] = useState(5);
    const [regularity, setRegularity] = useState<Regularity>("regular");
    const [hormonalContraception, setHormonalContraception] = useState(false);
    const [moments, setMoments] = useState(createDefaultNotificationMoments());
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
                    goal,
                    createdAt: now,
                },
                moments,
            );
        } finally {
            setSaving(false);
        }
    };

    return {
        step,
        setStep,
        goal,
        setGoal,
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
        moments,
        setMoments,
        saving,
        progress,
        finish,
    };
}
