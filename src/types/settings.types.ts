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
    tryingToConceive: boolean;
    createdAt: string;
}
