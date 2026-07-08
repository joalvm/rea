import type { ConfidenceLevel } from "@/db/enums/confidenceLevel";

const HIGH_MIN_VALID_CYCLES = 3;
const HIGH_MAX_SIGMA = 2;
const MEDIUM_MIN_VALID_CYCLES = 2;
const MEDIUM_MAX_SIGMA = 4;

/**
 * `high` = ≥3 ciclos válidos, σ ≤ 2 y ovulación con evidencia real (no calendario)
 * en el último ciclo. `medium` = ≥2 ciclos válidos y σ ≤ 4. `low` = resto.
 * Gobierna la UI (día exacto solo con `high`) y las notificaciones predictivas
 * (solo ≥ `medium`).
 */
export function confidence(input: {
    validCycleCount: number;
    sigma: number;
    hasOvulationEvidenceLastCycle: boolean;
}): ConfidenceLevel {
    if (
        input.validCycleCount >= HIGH_MIN_VALID_CYCLES &&
        input.sigma <= HIGH_MAX_SIGMA &&
        input.hasOvulationEvidenceLastCycle
    ) {
        return "high";
    }

    if (input.validCycleCount >= MEDIUM_MIN_VALID_CYCLES && input.sigma <= MEDIUM_MAX_SIGMA) {
        return "medium";
    }

    return "low";
}
