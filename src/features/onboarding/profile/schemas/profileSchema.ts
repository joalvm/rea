import { z } from "zod";

export const MIN_BIRTH_YEAR = 1925;
export const MAX_BIRTH_YEAR = new Date().getFullYear() - 10;
export const DEFAULT_BIRTH_YEAR = Math.max(MIN_BIRTH_YEAR, MAX_BIRTH_YEAR - 30);

export const profileSchema = z.object({
    name: z.string().trim().min(1, { error: "invalidName" }),
    birthYear: z
        .number()
        .int()
        .refine((value) => value >= MIN_BIRTH_YEAR && value <= MAX_BIRTH_YEAR, {
            error: "invalidBirthYear",
        }),
});
