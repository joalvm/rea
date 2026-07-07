import { z } from "zod";

import { contraceptionMethodValues } from "@/db/enums/reproductiveMode";

/** Método anticonceptivo declarado. `null` = prefirió no decirlo, elección de primera clase. */
export const contraceptionSchema = z.object({
    contraceptionMethod: z.enum(contraceptionMethodValues).nullable(),
});
