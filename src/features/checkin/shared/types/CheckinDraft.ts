import type { PeriodStatusSignal, QualitativeTestResult } from "@/db/enums/checkin";

/** Síntoma seleccionado en el paso de síntomas. `intensity` 1–5. */
export type DraftSymptom = {
    symptomKey: string;
    intensity: number;
};

/** Medicamento registrado en el paso de medicamentos. */
export type DraftMedication = {
    /** ID del catálogo personal si la usuaria eligió uno existente. */
    medicationId?: string;
    /** Nombre escrito a mano (para upsert en `medication_catalog` al guardar). */
    name?: string;
    /** Alivio reportado, 0–2. Opcional. */
    relief?: number;
    /** Nota de dosis o contexto. */
    doseNote?: string;
};

/** Evento de relaciones registrado en el paso de fertilidad. */
export type DraftIntercourse = {
    /** `true` si hubo protección, `false` si no, `null` si no se especifica. */
    isProtected: boolean | null;
};

/**
 * Borrador efímero del check-in (no cachea DB). Cada paso lee y escribe aquí; la
 * persistencia real ocurre en una sola transacción al guardar
 * (`shared/services/createCheckin`).
 */
export type CheckinDraft = {
    /** `YYYY-MM-DD` local del día del check-in. */
    localDate: string;
    /** Paso activo del wizard (índice 0-based) para reanudar navegación. */
    activeStep: number;

    // Sangrado
    bleedingIntensity: number | null;
    clots: number | null;
    periodStatusSignal: PeriodStatusSignal | null;

    // Ánimo y cuerpo (ánimo/energía/estrés)
    mood: number | null;
    energy: number | null;
    stressLevel: number | null;

    // Cuerpo (Fase 3): moco, cervix, BBT con hora, libido, peso, náuseas, movimiento
    cervicalMucus: number | null;
    cervicalPosition: number | null;
    basalBodyTempC: number | null;
    /** Hora de la toma de BBT en `HH:MM` (solo válida al despertar). */
    basalBodyTempTime: string | null;
    libido: number | null;
    weightKg: number | null;
    morningSickness: number | null;
    fetalMovement: number | null;

    // Fertilidad (Fase 3): OPK, test de embarazo, relaciones
    opkResult: QualitativeTestResult | null;
    pregnancyTestResult: QualitativeTestResult | null;
    intercourse: DraftIntercourse | null;

    // Síntomas + medicamentos
    symptoms: DraftSymptom[];
    medications: DraftMedication[];

    // Nota libre
    note: string | null;
};

function todayLocalISO(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export const INITIAL_CHECKIN_DRAFT: CheckinDraft = {
    localDate: todayLocalISO(),
    activeStep: 0,
    bleedingIntensity: null,
    clots: null,
    periodStatusSignal: null,
    mood: null,
    energy: null,
    stressLevel: null,
    cervicalMucus: null,
    cervicalPosition: null,
    basalBodyTempC: null,
    basalBodyTempTime: null,
    libido: null,
    weightKg: null,
    morningSickness: null,
    fetalMovement: null,
    opkResult: null,
    pregnancyTestResult: null,
    intercourse: null,
    symptoms: [],
    medications: [],
    note: null,
};

/**
 * ¿Tiene el borrador algo que persistir? Un check-in "nada que reportar" (todo
 * vacío) no debe crear basura. El motor de ciclo solo se interesa en sangrado y
 * señal de periodo; el resto alimenta curvas y frecuencias.
 */
export function hasCheckinContent(draft: CheckinDraft): boolean {
    return (
        draft.bleedingIntensity !== null ||
        draft.clots !== null ||
        draft.periodStatusSignal !== null ||
        draft.mood !== null ||
        draft.energy !== null ||
        draft.stressLevel !== null ||
        draft.cervicalMucus !== null ||
        draft.cervicalPosition !== null ||
        draft.basalBodyTempC !== null ||
        draft.libido !== null ||
        draft.weightKg !== null ||
        draft.morningSickness !== null ||
        draft.fetalMovement !== null ||
        draft.opkResult !== null ||
        draft.pregnancyTestResult !== null ||
        draft.intercourse !== null ||
        draft.symptoms.length > 0 ||
        draft.medications.length > 0 ||
        (draft.note !== null && draft.note.trim().length > 0)
    );
}
