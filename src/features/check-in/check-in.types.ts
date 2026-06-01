import {
    BleedingLevel,
    ClotSize,
    DailyLog,
    LibidoLevel,
    MedicationRelief,
    MomentType,
    MoodCheckIn,
    PainLocation,
    PainImpact,
    PmsState,
    SymptomKey,
} from "@/types/records.types";

/** Modalidades soportadas por el registro. */
export type CheckInMode = "daily" | "quick";

/** Payload lógico único del registro principal aunque persista en más de una tabla. */
export interface CheckInSubmission {
    moodCheckIn?: MoodCheckIn;
    dailyLog?: DailyLog;
}

/** Dependencias base para controlar el estado del modal. */
export interface CheckInFormConfig {
    mode: CheckInMode;
    momentType: MomentType;
    onClose: () => void;
    onDelete?: (checkIn?: MoodCheckIn | null) => Promise<void>;
    onSave: (submission: CheckInSubmission) => Promise<void>;
    initialCheckIn?: MoodCheckIn | null;
    initialDailyLog?: DailyLog | null;
    dailyLogOnly?: boolean;
}

/** Insumos para construir detalles opcionales de registro diario. */
export interface BuildDailyLogDetailsInput {
    periodStarted: boolean;
    periodEnded: boolean;
    pmsState: PmsState;
    clotSize: ClotSize;
    painImpact: PainImpact;
    painLocations: PainLocation[];
    symptomIntensities: Partial<Record<SymptomKey, number>>;
    libidoLevel: LibidoLevel;
    breastSensitivity: number;
    medicationName: string;
    medicationRelief: MedicationRelief;
}

/** Opción etiquetada usada por chips de selección del formulario. */
export interface CheckInOption<TValue> {
    key: TValue;
    label: string;
}

/** Alias local para opciones de sangrado. */
export type BleedingOption = CheckInOption<BleedingLevel>;

/** Alias local para opciones de impacto del dolor. */
export type PainImpactOption = CheckInOption<PainImpact>;

/** Alias local para opciones de alivio con medicación. */
export type MedicationReliefOption = CheckInOption<MedicationRelief>;

/** Alias local para opciones de tamaño de coágulo. */
export type ClotSizeOption = CheckInOption<ClotSize>;

/** Alias local para opciones de síntoma. */
export type SymptomOption = CheckInOption<SymptomKey>;

/** Alias local para opciones de ubicación de dolor. */
export type PainLocationOption = CheckInOption<PainLocation>;

/** Alias local para opciones de SPM. */
export type PmsStateOption = CheckInOption<PmsState>;

/** Alias local para opciones de libido. */
export type LibidoLevelOption = CheckInOption<LibidoLevel>;
