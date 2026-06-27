export const periodStatusSignalValues = ["started", "ended", "ongoing"] as const;

export const qualitativeTestResultValues = ["negative", "positive", "invalid"] as const;

export type PeriodStatusSignal = (typeof periodStatusSignalValues)[number];

export type QualitativeTestResult = (typeof qualitativeTestResultValues)[number];
