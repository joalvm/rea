import type { ConfidenceLevel } from "@/db/enums/confidenceLevel";
import type { OvulationBasis } from "@/db/enums/cycleRecord";

import type { FertileWindowResult } from "./FertileWindowResult";

/**
 * Resultado de `predictNextCycle`. `null` cuando el motor está pausado (embarazo
 * activo) o en posparto sin ancla (sin regla registrada desde el cierre del
 * episodio) — en ambos casos no hay base para predecir nada.
 */
export type CyclePredictionResult = {
    predictedNextStart: string;
    cycleLengthUsed: number;
    lutealPhaseUsed: number;
    predictedPeriodLength: number;
    predictedOvulation: string | null;
    ovulationBasis: OvulationBasis | null;
    fertileWindow: FertileWindowResult;
    confidence: ConfidenceLevel;
    basedOnDeclaredPrior: boolean;
} | null;
