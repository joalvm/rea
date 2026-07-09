import type { QualitativeTestResult } from "@/db/enums/checkin";

/**
 * Hecho mínimo de check-in que necesita el algoritmo puro de ciclo (jerarquía de
 * evidencia de ovulación en `estimateOvulation`). Fase 2 (`src/domain/projection/`)
 * lo extiende con los campos de agregación que necesita `daily_summary`.
 */
export type CheckinFact = {
    localDate: string;
    basalBodyTempC: number | null;
    opkResult: QualitativeTestResult | null;
    cervicalMucus: number | null;
};
