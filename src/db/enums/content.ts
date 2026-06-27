export const contentTypeValues = ["tip", "trivia", "recommendation", "educational", "alert"] as const;

export const contentSourceTypeValues = [
    "medical_guideline",
    "government_health",
    "peer_reviewed",
    "clinical_education",
    "book",
    "other",
] as const;

export const contentSurfaceValues = ["today", "day_detail", "statistics"] as const;

export const contentRuleTriggerTypeValues = [
    "phase",
    "symptom",
    "metric_threshold",
    "reproductive_intent",
    "contraception",
    "pregnancy_week",
    "general",
] as const;

export type ContentType = (typeof contentTypeValues)[number];

export type ContentSourceType = (typeof contentSourceTypeValues)[number];

export type ContentSurface = (typeof contentSurfaceValues)[number];

export type ContentRuleTriggerType = (typeof contentRuleTriggerTypeValues)[number];
