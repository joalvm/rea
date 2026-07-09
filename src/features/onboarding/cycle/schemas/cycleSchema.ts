import { z } from "zod";

export const CYCLE_LENGTH_MIN = 15;
export const CYCLE_LENGTH_MAX = 90;
export const PERIOD_LENGTH_MIN = 1;
export const PERIOD_LENGTH_MAX = 15;

/** Duración declarada de ciclo y sangrado. El sangrado nunca puede exceder al ciclo. */
export const cycleSchema = z
    .object({
        cycleLength: z.number().int().min(CYCLE_LENGTH_MIN).max(CYCLE_LENGTH_MAX),
        periodLength: z.number().int().min(PERIOD_LENGTH_MIN).max(PERIOD_LENGTH_MAX),
    })
    .refine((value) => value.periodLength <= value.cycleLength, {
        error: "periodExceedsCycle",
        path: ["periodLength"],
    });
