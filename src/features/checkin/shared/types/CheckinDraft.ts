import type { PeriodStatusSignal } from "@/db/enums/checkin";

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

    // Ánimo y cuerpo (Fase 2: ánimo/energía/estrés)
    mood: number | null;
    energy: number | null;
    stressLevel: number | null;

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
        draft.symptoms.length > 0 ||
        draft.medications.length > 0 ||
        (draft.note !== null && draft.note.trim().length > 0)
    );
}
