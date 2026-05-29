import { MetricScale } from "@/ui/MetricScale";

interface CheckInMetricsSectionProps {
    mood: number;
    energy: number;
    pain: number;
    breastSensitivity: number;
    stress: number;
    onMoodChange: (value: number) => void;
    onEnergyChange: (value: number) => void;
    onPainChange: (value: number) => void;
    onBreastSensitivityChange: (value: number) => void;
    onStressChange: (value: number) => void;
}

/** Agrupa métricas rápidas del check-in puntual o mixto. */
export default function CheckInMetricsSection({
    mood,
    energy,
    pain,
    breastSensitivity,
    stress,
    onMoodChange,
    onEnergyChange,
    onPainChange,
    onBreastSensitivityChange,
    onStressChange,
}: CheckInMetricsSectionProps) {
    return (
        <>
            <MetricScale highLabel="Muy bien" label="Ánimo" lowLabel="Bajo" onChange={onMoodChange} value={mood} />
            <MetricScale highLabel="Alta" label="Energía" lowLabel="Baja" onChange={onEnergyChange} value={energy} />
            <MetricScale
                highLabel="Fuerte"
                label="Dolor"
                lowLabel="Nada"
                min={0}
                onChange={onPainChange}
                value={pain}
            />
            <MetricScale
                highLabel="Muy sensible"
                label="Sensibilidad mamaria"
                lowLabel="Nada"
                min={0}
                onChange={onBreastSensitivityChange}
                value={breastSensitivity}
            />
            <MetricScale highLabel="Alto" label="Estrés" lowLabel="Bajo" onChange={onStressChange} value={stress} />
        </>
    );
}
