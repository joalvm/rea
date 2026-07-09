import { z } from "zod";

const reminderTimePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

export const reminderTimeSchema = z.string().refine((value) => reminderTimePattern.test(value), {
    error: "invalidTime",
});
