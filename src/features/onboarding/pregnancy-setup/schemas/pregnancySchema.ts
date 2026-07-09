import { z } from "zod";

import { isoDateSchema } from "@/shared/schemas/date/isoDateSchema";
import { addDaysToISO, todayYMD, ymdToISO } from "@/features/onboarding/shared/utils/onboardingDate";

/** Anclajes editables desde onboarding. La datación por ecografía no se captura aquí (plan 09). */
export const pregnancyDatingBasisValues = ["lmp", "due_date"] as const;

/** Ventana razonable alrededor de un embarazo a término (280 días), con margen. */
const PREGNANCY_DATE_WINDOW_DAYS = 300;

/**
 * Anclaje del embarazo: la usuaria declara UN dato (FUM o FPP), nunca ambos; el
 * otro se deriva con la regla de Naegele. `pregnancyDatingBasis` registra cuál
 * declaró de verdad, para que la semana gestacional mostrada tenga procedencia
 * honesta. Solo el dato declarado se valida contra hoy; el derivado hereda su
 * validez de él.
 */
export const pregnancySchema = z
    .object({
        pregnancyDatingBasis: z.enum(pregnancyDatingBasisValues),
        pregnancyLmp: isoDateSchema,
        pregnancyDueDate: isoDateSchema,
    })
    .refine((value) => value.pregnancyDueDate > value.pregnancyLmp, {
        error: "dueNotAfterLmp",
        path: ["pregnancyDueDate"],
    })
    .refine((value) => value.pregnancyDatingBasis !== "lmp" || value.pregnancyLmp <= ymdToISO(todayYMD()), {
        error: "lmpInFuture",
        path: ["pregnancyLmp"],
    })
    .refine(
        (value) =>
            value.pregnancyDatingBasis !== "lmp" ||
            value.pregnancyLmp >= addDaysToISO(ymdToISO(todayYMD()), -PREGNANCY_DATE_WINDOW_DAYS),
        { error: "lmpTooOld", path: ["pregnancyLmp"] },
    )
    .refine((value) => value.pregnancyDatingBasis !== "due_date" || value.pregnancyDueDate >= ymdToISO(todayYMD()), {
        error: "dueDateInPast",
        path: ["pregnancyDueDate"],
    })
    .refine(
        (value) =>
            value.pregnancyDatingBasis !== "due_date" ||
            value.pregnancyDueDate <= addDaysToISO(ymdToISO(todayYMD()), PREGNANCY_DATE_WINDOW_DAYS),
        { error: "dueDateTooFar", path: ["pregnancyDueDate"] },
    );
