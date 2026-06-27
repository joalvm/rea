export const menstruationBasisValues = ["none", "confirmed_period", "inferred_bleeding"] as const;

export const estimatedPhaseValues = [
    "unknown",
    "menstrual",
    "follicular",
    "fertile_window",
    "estimated_ovulation",
    "luteal",
    "pregnancy_first_trimester",
    "pregnancy_second_trimester",
    "pregnancy_third_trimester",
] as const;

export const phaseSourceValues = ["observed", "estimated", "unknown"] as const;

export type MenstruationBasis = (typeof menstruationBasisValues)[number];

export type EstimatedPhase = (typeof estimatedPhaseValues)[number];

export type PhaseSource = (typeof phaseSourceValues)[number];
