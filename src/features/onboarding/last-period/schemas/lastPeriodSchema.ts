import { z } from "zod";

import { isoDateSchema } from "@/shared/schemas/date/isoDateSchema";

export const lastPeriodSchema = z
    .object({
        lastPeriodEnd: isoDateSchema.nullable(),
        lastPeriodOngoing: z.boolean(),
        lastPeriodStart: isoDateSchema.nullable(),
    })
    .refine((value) => value.lastPeriodStart != null || value.lastPeriodEnd == null, {
        error: "invalidStart",
        path: ["lastPeriodStart"],
    })
    .refine((value) => value.lastPeriodStart == null || value.lastPeriodOngoing || value.lastPeriodEnd != null, {
        error: "invalidEnd",
        path: ["lastPeriodEnd"],
    })
    .refine(
        (value) =>
            value.lastPeriodStart == null ||
            value.lastPeriodOngoing ||
            value.lastPeriodEnd == null ||
            value.lastPeriodEnd >= value.lastPeriodStart,
        {
            error: "endBeforeStart",
            path: ["lastPeriodEnd"],
        },
    )
    .transform((value) => ({
        lastPeriodEnd: value.lastPeriodStart == null || value.lastPeriodOngoing ? null : value.lastPeriodEnd,
        lastPeriodOngoing: value.lastPeriodOngoing,
        lastPeriodStart: value.lastPeriodStart,
    }));
