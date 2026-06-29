import type { Regularity, ReproductiveMode } from "@/db/enums/reproductiveMode";
import { defaultReminderSettings } from "@/shared/schemas/reminder/reminderDefaults";

import { profileSchema } from "../../profile/schemas/profileSchema";

/** Modo de seguimiento reproductivo elegido en la pantalla de intención. */
export type IntentChoice = {
    reproductiveMode: ReproductiveMode;
};

/** Las 4 intenciones de onboarding. Las etiquetas vienen de i18n (`intent.<key>.*`). */
export const INTENT_CHOICES = [
    { key: "track", reproductiveMode: "tracking_only" },
    { key: "avoid", reproductiveMode: "tracking_avoid_pregnancy" },
    { key: "ttc", reproductiveMode: "tracking_ttc" },
    { key: "preg", reproductiveMode: "pregnancy_tracking" },
] as const satisfies readonly ({ key: string } & IntentChoice)[];

export type IntentKey = (typeof INTENT_CHOICES)[number]["key"];

export type RegularitySelection = Regularity | "unsure";

/** Estado efímero del formulario de onboarding (no cachea DB). */
export type OnboardingDraft = {
    name: string;
    birthYear: number | null;
    intent: IntentChoice | null;
    /** YYYY-MM-DD del inicio del último periodo (modos de seguimiento de ciclo). */
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
    lastPeriodOngoing: true,
    lastPeriodEnd: null,
    cycleLength: 28,
    periodLength: 5,
    regularity: "regular",
    regularitySelection: null,
    hormonalContraception: false,
    pregnancyLmp: null,
    pregnancyDueDate: null,
    remindersEnabled: defaultReminderSettings.remindersEnabled,
    reminderWindowStart: defaultReminderSettings.reminderWindowStart,
    reminderWindowEnd: defaultReminderSettings.reminderWindowEnd,
    reminderIntervalHours: defaultReminderSettings.reminderIntervalHours,
};

/** Encuentra la definición de intención por clave. */
export function findIntent(key: IntentKey): IntentChoice | undefined {
    return INTENT_CHOICES.find((choice) => choice.key === key);
}

/** ¿Está completa la captura de perfil (nombre + año)? Habilita el CTA de `profile`. */
export function isProfileComplete(draft: OnboardingDraft): boolean {
    return profileSchema.safeParse({
        birthYear: draft.birthYear,
        name: draft.name,
    }).success;
}
