export const reproductiveModeValues = ["cycle_tracking", "ttc", "pregnancy"] as const;

export const reproductiveModeFilterValues = [...reproductiveModeValues, "all"] as const;

export const regularityValues = ["regular", "variable", "irregular"] as const;

export type ReproductiveMode = (typeof reproductiveModeValues)[number];

export type ReproductiveModeFilter = (typeof reproductiveModeFilterValues)[number];

export type Regularity = (typeof regularityValues)[number];
