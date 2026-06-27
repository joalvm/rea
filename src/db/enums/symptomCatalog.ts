export const symptomGroupValues = [
    "pain",
    "digestive",
    "skin",
    "sleep",
    "mood",
    "energy",
    "bleeding",
    "body",
    "sexual_health",
    "other",
] as const;

export type SymptomGroup = (typeof symptomGroupValues)[number];
