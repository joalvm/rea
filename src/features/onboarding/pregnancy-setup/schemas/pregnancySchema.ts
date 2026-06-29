import { z } from "zod";

import { isoDateSchema } from "@/shared/schemas/date/isoDateSchema";

export const pregnancySchema = z
    .object({
        pregnancyDueDate: isoDateSchema.nullable(),
        pregnancyLmp: isoDateSchema,
    })
    .refine((value) => value.pregnancyDueDate == null || value.pregnancyDueDate > value.pregnancyLmp, {
        error: "dueNotAfterLmp",
        path: ["pregnancyDueDate"],
    });
