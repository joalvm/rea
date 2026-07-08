import type { PeriodStatusSignal } from "@/db/enums/checkin";
import type { CheckinFact } from "@/domain/cycle/types/CheckinFact";

/** Síntoma marcado en un check-in, con la prioridad de UI ya joineada desde `symptom_catalog`. */
export type SymptomEntry = { symptomKey: string; intensity: number; uiPriority: number };

/** Toma de medicamento marcada en un check-in. */
export type MedicationEntry = { relief: number | null };

/**
 * Extiende `CheckinFact` (Fase 1) con los campos que necesita `projectRange` para
 * agregar `daily_summary`. El orquestador (Fase 3) pre-joinea síntomas y
 * medicamentos antes de llamar a `projectRange`, así este módulo sigue sin tocar
 * la base de datos.
 */
export type CheckinProjectionFact = CheckinFact & {
    bleedingIntensity: number | null;
    periodStatusSignal: PeriodStatusSignal | null;
    mood: number | null;
    energy: number | null;
    stressLevel: number | null;
    painIntensity: number | null;
    excludedFromSummary: boolean;
    symptoms: SymptomEntry[];
    medications: MedicationEntry[];
};
