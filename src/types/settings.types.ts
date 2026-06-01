/** Define intereses principales que la usuaria quiere priorizar en Rea. */
export type Goal = "self_knowledge" | "trying_to_conceive";

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
    goals: Goal[];
    createdAt: string;
}
