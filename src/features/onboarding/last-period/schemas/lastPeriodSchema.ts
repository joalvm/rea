import { z } from "zod";

import { isoDateSchema } from "@/shared/schemas/date/isoDateSchema";
import { todayYMD, ymdToISO } from "@/shared/utils/ymd";

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
    .refine((value) => value.lastPeriodStart == null || value.lastPeriodStart <= ymdToISO(todayYMD()), {
        error: "startInFuture",
        path: ["lastPeriodStart"],
    })
    .refine((value) => value.lastPeriodEnd == null || value.lastPeriodEnd <= ymdToISO(todayYMD()), {
        error: "endInFuture",
        path: ["lastPeriodEnd"],
    })
    .transform((value) => ({
        lastPeriodEnd: value.lastPeriodStart == null || value.lastPeriodOngoing ? null : value.lastPeriodEnd,
        lastPeriodOngoing: value.lastPeriodOngoing,
        lastPeriodStart: value.lastPeriodStart,
    }));
