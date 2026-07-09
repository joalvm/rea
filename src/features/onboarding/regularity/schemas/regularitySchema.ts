import { z } from "zod";

import { regularityValues } from "@/db/enums/reproductiveMode";

/** Regularidad declarada. Debe ser uno de los valores admitidos del ciclo. */
export const regularitySchema = z.object({
    regularity: z.enum(regularityValues),
});
