import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation("checkIn");

    return (
        <>
            <MetricScale
                highLabel={t("scale.veryGood")}
                label={t("metrics.mood")}
                lowLabel={t("scale.low")}
                onChange={onMoodChange}
                value={mood}
            />
            <MetricScale
                highLabel={t("daily.libido.high")}
                label={t("metrics.energy")}
                lowLabel={t("daily.libido.low")}
                onChange={onEnergyChange}
                value={energy}
            />
            <MetricScale
                highLabel={t("scale.strong")}
                label={t("metrics.pain")}
                lowLabel={t("scale.nothing")}
                min={0}
                onChange={onPainChange}
                value={pain}
            />
            <MetricScale
                highLabel={t("scale.verySensitive")}
                label={t("metrics.breastSensitivity")}
                lowLabel={t("scale.nothing")}
                min={0}
                onChange={onBreastSensitivityChange}
                value={breastSensitivity}
            />
            <MetricScale
                highLabel={t("scale.high")}
                label={t("metrics.stress")}
                lowLabel={t("scale.low")}
                onChange={onStressChange}
                value={stress}
            />
        </>
    );
}
