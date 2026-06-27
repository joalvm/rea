export const confidenceLevelValues = ["low", "medium", "high"] as const;

export type ConfidenceLevel = (typeof confidenceLevelValues)[number];
