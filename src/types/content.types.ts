import { ContentSurface, ContentType, PhaseConfidence } from "@/modules/storage/schemas/entities";

/** Contexto observado que Rea usa para elegir contenido editorial local. */
export interface EditorialContentContext {
    surface: ContentSurface;
    locale: string;
    phase?: string;
    phaseConfidence?: PhaseConfidence;
    symptomKeys: string[];
    metrics: Partial<Record<string, number | null>>;
    tryingToConceive?: boolean;
    hormonalContraception?: boolean;
    limit: number;
}

/** Pieza editorial lista para resolver copy visible mediante i18n local. */
export interface EditorialContentCard {
    id: string;
    contentType: ContentType;
    topic: string;
    titleKey: string;
    bodyKey: string;
    sourceLabelKey: string | null;
    sourceReferenceKey: string | null;
    sourceUrl: string | null;
}
