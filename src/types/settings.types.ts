/** Define objetivo principal de uso de Rea. */
export type Goal = "self_knowledge" | "trying_to_conceive" | "track_only";

/** Describe regularidad percibida del ciclo. */
export type Regularity = "regular" | "variable" | "irregular";

/** Guarda preferencias base y estado de onboarding. */
export interface AppSettings {
    onboarded: boolean;
    lastPeriodStart: string;
    cycleLength: number;
    periodLength: number;
    regularity: Regularity;
    hormonalContraception: boolean;
    goal: Goal;
    createdAt: string;
}
