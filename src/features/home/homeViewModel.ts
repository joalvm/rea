import type { TFunction } from "i18next";

import type { EstimatedPhase } from "@/db/enums/dailySummary";
import type { CyclePrediction } from "@/db/schema/cyclePrediction";
import type { ReproductiveMode } from "@/db/enums/reproductiveMode";
import type { PhaseKey } from "@/theme/types/PhaseColors";

/** Resuelve la fase cromática del Home a partir de proyección e intención activa. */
export function resolveHomePhase(
    phase: EstimatedPhase | null | undefined,
    mode: ReproductiveMode | null | undefined,
): PhaseKey {
    if (mode === "pregnancy_tracking" || phase?.startsWith("pregnancy_") === true) {
        return "pregnancy";
    }
    if (isCyclePhase(phase)) {
        return phase;
    }
    return "unknown";
}

const CYCLE_PHASE_KEYS = new Set<Exclude<PhaseKey, "pregnancy">>([
    "unknown",
    "menstrual",
    "follicular",
    "fertile_window",
    "estimated_ovulation",
    "luteal",
]);

function isCyclePhase(phase: EstimatedPhase | null | undefined): phase is Exclude<PhaseKey, "pregnancy"> {
    return phase !== null && phase !== undefined && CYCLE_PHASE_KEYS.has(phase as Exclude<PhaseKey, "pregnancy">);
}

/** Produce el siguiente evento que el Home muestra según el modo y predicción disponible. */
export function getHomeNextEventLabel(
    t: TFunction<"home">,
    mode: ReproductiveMode | null | undefined,
    prediction: Pick<CyclePrediction, "predictedNextStart" | "predictedFertileStart" | "predictedFertileEnd"> | null,
    today: string,
): string {
    if (mode === "pregnancy_tracking") {
        return t("summary.nextPregnancy");
    }
    if (prediction === null) {
        return t("summary.noPrediction");
    }
    if (
        (mode === "tracking_ttc" || mode === "tracking_avoid_pregnancy") &&
        prediction.predictedFertileStart !== null &&
        prediction.predictedFertileEnd !== null
    ) {
        return t("summary.nextFertile", {
            date: formatHomeDateRange(prediction.predictedFertileStart, prediction.predictedFertileEnd),
        });
    }
    return t("summary.nextPeriod", { date: formatHomeDateRange(prediction.predictedNextStart, today) });
}

function formatHomeDateRange(from: string, to: string): string {
    return from === to ? from : `${from} – ${to}`;
}
