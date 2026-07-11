import { create } from "zustand";

import type { CheckinDraft, DraftMedication, DraftSymptom } from "../types/CheckinDraft";
import { INITIAL_CHECKIN_DRAFT } from "../types/CheckinDraft";

type CheckinState = {
    draft: CheckinDraft;
    /** Mezcla un parche plano en el borrador. */
    set: (patch: Partial<CheckinDraft>) => void;
    /** Marca o desmarca un síntoma (toggle). Al marcar usa intensidad por defecto 2. */
    toggleSymptom: (symptomKey: string) => void;
    /** Cambia la intensidad de un síntoma ya marcado. */
    setSymptomIntensity: (symptomKey: string, intensity: number) => void;
    /** Añade o actualiza un medicamento del borrador (por medicationId o name). */
    upsertMedication: (med: DraftMedication) => void;
    /** Quita un medicamento del borrador (por medicationId o name). */
    removeMedication: (key: { medicationId?: string; name?: string }) => void;
    /** Vuelve al borrador inicial. */
    reset: () => void;
};

function medKey(med: DraftMedication): string {
    return med.medicationId ?? med.name ?? "";
}

/**
 * Store efímero del check-in (Zustand, sin persistencia). Cada paso lee y
 * escribe aquí directamente; la persistencia real ocurre en una sola
 * transacción al guardar (`shared/services/createCheckin`). No cachea datos de
 * la DB.
 */
export const useCheckinStore = create<CheckinState>((set) => ({
    draft: INITIAL_CHECKIN_DRAFT,
    set: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),
    toggleSymptom: (symptomKey) =>
        set((state) => {
            const exists = state.draft.symptoms.find((s) => s.symptomKey === symptomKey);
            const symptoms: DraftSymptom[] = exists
                ? state.draft.symptoms.filter((s) => s.symptomKey !== symptomKey)
                : [...state.draft.symptoms, { symptomKey, intensity: 2 }];
            return { draft: { ...state.draft, symptoms } };
        }),
    setSymptomIntensity: (symptomKey, intensity) =>
        set((state) => ({
            draft: {
                ...state.draft,
                symptoms: state.draft.symptoms.map((s) => (s.symptomKey === symptomKey ? { ...s, intensity } : s)),
            },
        })),
    upsertMedication: (med) =>
        set((state) => {
            const key = medKey(med);
            const exists = state.draft.medications.find((m) => medKey(m) === key);
            const medications: DraftMedication[] = exists
                ? state.draft.medications.map((m) => (medKey(m) === key ? { ...m, ...med } : m))
                : [...state.draft.medications, med];
            return { draft: { ...state.draft, medications } };
        }),
    removeMedication: (key) =>
        set((state) => ({
            draft: {
                ...state.draft,
                medications: state.draft.medications.filter(
                    (m) =>
                        (key.medicationId && m.medicationId !== key.medicationId) || (key.name && m.name !== key.name),
                ),
            },
        })),
    reset: () => set({ draft: INITIAL_CHECKIN_DRAFT }),
}));
