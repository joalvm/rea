import { z } from "zod";

import { isoDateSchema } from "@/shared/schemas/date/isoDateSchema";
import { todayYMD, ymdToISO } from "@/features/onboarding/shared/utils/onboardingDate";

export const pregnancySchema = z
    .object({
        pregnancyDueDate: isoDateSchema.nullable(),
        pregnancyLmp: isoDateSchema,
    })
    .refine((value) => value.pregnancyLmp <= ymdToISO(todayYMD()), {
        error: "lmpInFuture",
        path: ["pregnancyLmp"],
    })
    .refine((value) => value.pregnancyDueDate == null || value.pregnancyDueDate > value.pregnancyLmp, {
        error: "dueNotAfterLmp",
        path: ["pregnancyDueDate"],
    });
