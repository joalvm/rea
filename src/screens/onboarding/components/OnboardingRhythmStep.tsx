import { NumberPicker } from "../../../ui/NumberPicker";
import { StepShell } from "../../../ui/StepShell";

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
    return (
        <StepShell
            icon="tune-variant"
            subtitle="Puedes corregirlo luego cuando tengas más registros."
            title="Tu ritmo aproximado"
        >
            <NumberPicker label="Duración del ciclo" onChange={onChangeCycleLength} suffix="días" value={cycleLength} />
            <NumberPicker
                label="Duración del sangrado"
                max={10}
                min={2}
                onChange={onChangePeriodLength}
                suffix="días"
                value={periodLength}
            />
        </StepShell>
    );
}
