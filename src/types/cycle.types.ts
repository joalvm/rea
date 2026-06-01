/** Identifica fase estimada u observada del ciclo. */
export type PhaseKey = "menstrual" | "follicular" | "fertile" | "luteal";

/** Distingue origen observado, estimado o desconocido de dato. */
export type DataSource = "observed" | "estimated" | "unknown";

/** Explica qué base controla la fase actual mostrada. */
export type PhaseSource = "observed_signals" | "history_anchor" | "initial_setup";

/** Expresa confianza general de prediccion mostrada. */
export type PredictionConfidence = "low" | "medium" | "high";

/** Representa ciclo persistido en historial local. */
export interface Cycle {
    id?: number;
    startDate: string;
    endDate?: string | null;
    predicted: boolean;
    source?: DataSource;
    createdAt: string;
}

/** Resume ciclo observado o estimado para patrones historicos. */
export interface CycleSummary {
    id: string;
    startDate: string;
    endDate: string | null;
    source: DataSource;
    cycleLengthDays: number | null;
    bleedingDays: number;
    heavyDays: number;
    painImpactDays: number;
    topSymptoms: string[];
}

/** Agrupa snapshot de ciclo usado por pantalla actual y calendario. */
export interface CycleSnapshot {
    cycleDay: number;
    phase: PhaseKey;
    source: DataSource;
    phaseSource: PhaseSource;
    sourceLabel: string;
    phaseSourceLabel: string;
    confidence: PredictionConfidence;
    confidenceLabel: string;
    confidenceNote: string;
    confidenceReason: string;
    phaseLabel: string;
    phaseMessage: string;
    anchorDate: string | null;
    activeSignals: string[];
    nextPeriodInDays: number;
    nextPeriodLabel: string;
    fertileWindowLabel: string;
    fertilityVisible: boolean;
    fertilityStatusLabel: string;
    observedCycleCount: number;
    cycleLengthEstimate: number;
    periodLengthEstimate: number;
    week: {
        iso: string;
        day: number;
        weekday: string;
        isToday: boolean;
        isPeriod: boolean;
        periodSource: DataSource;
        isFertile: boolean;
    }[];
}
