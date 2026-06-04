/** Marca severidad educativa de alerta mostrada. */
export type AlertSeverity = "info" | "watch" | "consult";

/** Define tono de insight o recomendacion. */
export type InsightTone = "supportive" | "watch";

/** Representa insight sintetizado desde historial real. */
export interface ObservedInsight {
    id: string;
    title: string;
    detail: string;
    tone: InsightTone;
}

/** Representa alerta educativa contextual para pantalla. */
export interface EducationalAlert {
    id: string;
    severity: AlertSeverity;
    title: string;
    detail: string;
}
