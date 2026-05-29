import {
    BleedingLevel,
    ClotSize,
    DailyLog,
    MedicationRelief,
    MomentType,
    MoodCheckIn,
    PainImpact,
} from "../../types/records.types";

/** Modalidades soportadas por el registro. */
export type CheckInMode = "daily" | "quick";

/** Define qué entidades persiste el modal al guardar. */
export type CheckInSaveTarget = "checkIn" | "dailyLog" | "both";

/** Props del modal de check-in diario o puntual. */
export interface CheckInModalProps {
    visible: boolean;
    mode: CheckInMode;
    momentType: MomentType;
    question: string;
    onClose: () => void;
    onDelete?: (checkIn?: MoodCheckIn | null) => Promise<void>;
    onSave: (checkIn?: MoodCheckIn, dailyLog?: DailyLog) => Promise<void>;
    initialCheckIn?: MoodCheckIn | null;
    initialDailyLog?: DailyLog | null;
    saveTarget?: CheckInSaveTarget;
}

/** Dependencias base para controlar el estado del modal. */
export interface CheckInFormConfig {
    mode: CheckInMode;
    momentType: MomentType;
    onClose: () => void;
    onDelete?: (checkIn?: MoodCheckIn | null) => Promise<void>;
    onSave: (checkIn?: MoodCheckIn, dailyLog?: DailyLog) => Promise<void>;
    initialCheckIn?: MoodCheckIn | null;
    initialDailyLog?: DailyLog | null;
    saveTarget: CheckInSaveTarget;
}

/** Insumos para construir detalles opcionales de registro diario. */
export interface BuildDailyLogDetailsInput {
    periodStarted: boolean;
    periodEnded: boolean;
    pmsStarted: boolean;
    clotSize: ClotSize;
    painImpact: PainImpact;
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
