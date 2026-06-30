import { z } from "zod";

/** Uso de anticoncepción hormonal. Decisión binaria explícita. */
export const contraceptionSchema = z.object({
    hormonalContraception: z.boolean(),
});
