import type { CycleIntent, Regularity, ReproductiveMode } from "@/db/enums/reproductiveMode";

/** Par `(currentMode, cycleIntent)` elegido en la pantalla de intención. */
export type IntentChoice = {
    currentMode: ReproductiveMode;
    /** `null` para `ttc` y `pregnancy`. */
    cycleIntent: CycleIntent | null;
};

/** Las 4 intenciones de onboarding. Las etiquetas vienen de i18n (`intent.<key>.*`). */
export const INTENT_CHOICES = [
    { key: "track", currentMode: "cycle_tracking", cycleIntent: "track_only" },
    { key: "avoid", currentMode: "cycle_tracking", cycleIntent: "avoid_pregnancy" },
    { key: "ttc", currentMode: "ttc", cycleIntent: null },
    { key: "preg", currentMode: "pregnancy", cycleIntent: null },
] as const satisfies readonly ({ key: string } & IntentChoice)[];

export type IntentKey = (typeof INTENT_CHOICES)[number]["key"];

export type RegularitySelection = Regularity | "unsure";

/** Estado efímero del formulario de onboarding (no cachea DB). */
export type OnboardingDraft = {
    name: string;
    birthYear: number | null;
    intent: IntentChoice | null;
    /** YYYY-MM-DD del inicio del último periodo (cycle_tracking/ttc). */
    lastPeriodStart: string | null;
    lastPeriodOngoing: boolean;
    lastPeriodEnd: string | null;
    cycleLength: number;
    periodLength: number;
    regularity: Regularity;
    regularitySelection: RegularitySelection | null;
    hormonalContraception: boolean;
    /** YYYY-MM-DD de la FUM del embarazo. */
    pregnancyLmp: string | null;
    pregnancyDueDate: string | null;
    remindersEnabled: boolean;
    reminderWindowStart: string;
    reminderWindowEnd: string;
    reminderIntervalHours: number;
};

export const INITIAL_ONBOARDING_DRAFT: OnboardingDraft = {
    name: "",
    birthYear: null,
    intent: null,
    lastPeriodStart: null,
    lastPeriodOngoing: false,
    lastPeriodEnd: null,
    cycleLength: 28,
    periodLength: 5,
    regularity: "regular",
    regularitySelection: null,
    hormonalContraception: false,
    pregnancyLmp: null,
    pregnancyDueDate: null,
    remindersEnabled: true,
    reminderWindowStart: "09:00",
    reminderWindowEnd: "22:00",
    reminderIntervalHours: 6,
};

/** Encuentra la definición de intención por clave. */
export function findIntent(key: IntentKey): IntentChoice | undefined {
    return INTENT_CHOICES.find((choice) => choice.key === key);
}

/** ¿Está completa la captura de perfil (nombre + año)? Habilita el CTA de `profile`. */
export function isProfileComplete(draft: OnboardingDraft): boolean {
    return draft.name.trim().length > 0 && draft.birthYear !== null;
}
