import { create } from "zustand";

import { type IntentChoice, INITIAL_ONBOARDING_DRAFT, type OnboardingDraft } from "../types/OnboardingDraft";

type OnboardingState = {
    draft: OnboardingDraft;
    /** Mezcla un parche plano en el borrador. */
    set: (patch: Partial<OnboardingDraft>) => void;
    /** Fija la intención reproductiva elegida. */
    setIntent: (intent: IntentChoice) => void;
    /** Vuelve al borrador inicial. */
    reset: () => void;
};

/**
 * Store efímero del onboarding (Zustand, sin persistencia). Cada pantalla lee y
 * escribe aquí directamente; la persistencia real ocurre en una sola transacción
 * al completar (`complete/services/completeOnboarding`). No cachea datos de la DB.
 */
export const useOnboardingStore = create<OnboardingState>((set) => ({
    draft: INITIAL_ONBOARDING_DRAFT,
    set: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),
    setIntent: (intent) => set((state) => ({ draft: { ...state.draft, intent } })),
    reset: () => set({ draft: INITIAL_ONBOARDING_DRAFT }),
}));
