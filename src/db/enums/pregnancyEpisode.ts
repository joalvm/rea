export const pregnancyOutcomeValues = ["birth", "loss", "other"] as const;

export type PregnancyOutcome = (typeof pregnancyOutcomeValues)[number];
