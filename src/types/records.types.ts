import { DataSource } from "./cycle.types";

/** Identifica momento del dia asociado a check-in. */
export type MomentType = "morning" | "night" | "custom" | "now";

/** Describe intensidad de sangrado registrada para dia. */
export type BleedingLevel = "none" | "spotting" | "light" | "medium" | "heavy";

/** Describe tamano observado de coagulos. */
export type ClotSize = "none" | "small" | "medium" | "large";

/** Resume impacto funcional del dolor reportado. */
export type PainImpact = "none" | "noticeable" | "limits_day" | "stops_day";

/** Describe alivio percibido tras medicacion. */
export type MedicationRelief = "not_applicable" | "helped" | "partly_helped" | "did_not_help";

/** Guarda anotacion puntual de estado emocional y fisico. */
export interface MoodCheckIn {
    id?: number;
    datetime: string;
    momentType: MomentType;
    mood: number;
    energy: number;
    pain: number;
    breastSensitivity: number;
    stress: number;
    note?: string | null;
}

/** Agrupa metadatos clinicos opcionales de registro diario. */
export interface DailyLogDetails {
    periodStarted?: boolean;
    periodEnded?: boolean;
    pmsStarted?: boolean;
    clotSize?: ClotSize;
    painImpact?: PainImpact;
    breastSensitivity?: number;
    medicationName?: string | null;
    medicationRelief?: MedicationRelief;
}

/** Guarda resumen diario de sintomas, sangrado y notas. */
export interface DailyLog {
    date: string;
    bleedingLevel: BleedingLevel;
    symptoms: string[];
    notes?: string | null;
    source?: DataSource;
    details?: DailyLogDetails | null;
    updatedAt: string;
}