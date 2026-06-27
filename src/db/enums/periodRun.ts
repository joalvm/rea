export const periodRunStatusValues = ["open", "closed", "excluded"] as const;

export const periodRunSourceValues = ["user_confirmed", "bleeding_inferred", "mixed"] as const;

export type PeriodRunStatus = (typeof periodRunStatusValues)[number];

export type PeriodRunSource = (typeof periodRunSourceValues)[number];
