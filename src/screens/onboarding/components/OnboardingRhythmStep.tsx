import { useTranslation } from "react-i18next";

import { NumberPicker } from "@/ui/NumberPicker";
import { StepShell } from "@/ui/StepShell";

interface OnboardingRhythmStepProps {
    cycleLength: number;
    onChangeCycleLength: (value: number) => void;
    onChangePeriodLength: (value: number) => void;
    periodLength: number;
}

/** Ajusta los valores iniciales de ciclo y sangrado estimados. */
export default function OnboardingRhythmStep({
    cycleLength,
    onChangeCycleLength,
    onChangePeriodLength,
    periodLength,
}: OnboardingRhythmStepProps) {
    const { t } = useTranslation("onboarding");

    return (
        <StepShell icon="tune-variant" subtitle={t("rhythm.subtitle")} title={t("rhythm.title")}>
            <NumberPicker
                label={t("rhythm.cycleLength")}
                onChange={onChangeCycleLength}
                suffix={t("rhythm.days")}
                value={cycleLength}
            />
            <NumberPicker
                label={t("rhythm.periodLength")}
                max={10}
                min={2}
                onChange={onChangePeriodLength}
                suffix={t("rhythm.days")}
                value={periodLength}
            />
        </StepShell>
    );
}
