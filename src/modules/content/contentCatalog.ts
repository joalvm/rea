import { ContentType, PhaseConfidence } from "@/modules/storage/schemas/entities";

export const CONTENT_CATALOG_VERSION = "2026.06.04";

export interface ContentItemSeed {
    id: string;
    content_type: ContentType;
    topic: string;
    title_key: string;
    body_key: string;
    min_confidence: PhaseConfidence | null;
    priority: number;
    locale: string;
    source_id: string | null;
    content_version: string;
    reviewed_at: string;
}

/** Piezas editoriales locales; copy visible vive en src/lang y aqui solo quedan claves. */
const contentCatalog: ContentItemSeed[] = [
    {
        id: "cycle_basics",
        content_type: "educational",
        topic: "cycle_basics",
        title_key: "content:items.cycleBasics.title",
        body_key: "content:items.cycleBasics.body",
        min_confidence: null,
        priority: 10,
        locale: "es",
        source_id: "owh_menstrual_cycle",
        content_version: CONTENT_CATALOG_VERSION,
        reviewed_at: "2026-06-04",
    },
    {
        id: "period_pain_care",
        content_type: "recommendation",
        topic: "period_pain",
        title_key: "content:items.periodPainCare.title",
        body_key: "content:items.periodPainCare.body",
        min_confidence: null,
        priority: 20,
        locale: "es",
        source_id: "medline_period_pain",
        content_version: CONTENT_CATALOG_VERSION,
        reviewed_at: "2026-06-04",
    },
    {
        id: "heavy_bleeding_observation",
        content_type: "alert",
        topic: "heavy_bleeding",
        title_key: "content:items.heavyBleedingObservation.title",
        body_key: "content:items.heavyBleedingObservation.body",
        min_confidence: null,
        priority: 30,
        locale: "es",
        source_id: "acog_dysmenorrhea",
        content_version: CONTENT_CATALOG_VERSION,
        reviewed_at: "2026-06-04",
    },
    {
        id: "pms_observation",
        content_type: "tip",
        topic: "pms",
        title_key: "content:items.pmsObservation.title",
        body_key: "content:items.pmsObservation.body",
        min_confidence: "medium",
        priority: 40,
        locale: "es",
        source_id: "acog_pms",
        content_version: CONTENT_CATALOG_VERSION,
        reviewed_at: "2026-06-04",
    },
    {
        id: "spotting_context",
        content_type: "educational",
        topic: "spotting",
        title_key: "content:items.spottingContext.title",
        body_key: "content:items.spottingContext.body",
        min_confidence: null,
        priority: 50,
        locale: "es",
        source_id: "owh_menstrual_cycle",
        content_version: CONTENT_CATALOG_VERSION,
        reviewed_at: "2026-06-04",
    },
];

export default contentCatalog;
