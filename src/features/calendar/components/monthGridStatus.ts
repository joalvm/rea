import type { TFunction } from "i18next";

import type { CyclePrediction } from "@/db/schema/cyclePrediction";
import type { DailySummary } from "@/db/schema/dailySummary";
import type { SemanticColors } from "@/theme/types/SemanticColors";

export type MonthGridDayStatus = {
    accent?: keyof SemanticColors;
    estimated?: boolean;
    hasEvent: boolean;
    label: string;
    surface?: keyof SemanticColors;
    text?: keyof SemanticColors;
};

type CalendarTranslation = TFunction<"calendar">;

/** Decide el estado visual y accesible de una fecha del calendario. */
export function getMonthGridDayStatus(
    summary: DailySummary | undefined,
    prediction: CyclePrediction | null,
    localDate: string,
    t: CalendarTranslation,
): MonthGridDayStatus {
    const isPredictedPeriod = prediction?.predictedNextStart === localDate;
    const isPredictedFertile =
        prediction !== null &&
        prediction.predictedFertileStart !== null &&
        prediction.predictedFertileEnd !== null &&
        localDate >= prediction.predictedFertileStart &&
        localDate <= prediction.predictedFertileEnd;

    if (!summary) {
        if (isPredictedPeriod) {
            return { accent: "danger", estimated: true, hasEvent: true, label: t("day.predictedPeriod") };
        }
        if (isPredictedFertile) {
            return { accent: "warning", estimated: true, hasEvent: true, label: t("day.fertile"), text: "warningText" };
        }
        return { hasEvent: false, label: t("day.none") };
    }

    if (summary.isMenstruationDay) {
        return {
            accent: "danger",
            hasEvent: summary.checkinCount > 0,
            label: t("day.menstruation"),
            surface: "dangerSurface",
            text: "dangerText",
            estimated: isPredictedPeriod,
        };
    }

    if (summary.isFertileDay) {
        return {
            accent: "warning",
            hasEvent: summary.checkinCount > 0,
            label: t("day.fertile"),
            surface: "warningSurface",
            text: "warningText",
            estimated: isPredictedFertile,
        };
    }

    return {
        accent: "primary",
        hasEvent: summary.checkinCount > 0 || summary.hadMedication || summary.hadIntercourse,
        label: summary.phaseSource === "estimated" ? t("day.estimated") : t("day.recorded"),
        estimated: isPredictedPeriod || isPredictedFertile,
    };
}
