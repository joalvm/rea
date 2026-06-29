import { z } from "zod";

import { reminderIntervalHoursOptions } from "./reminderDefaults";
import { parseReminderTime } from "./parseReminderTime";
import { reminderTimeSchema } from "./reminderTimeSchema";

const reminderIntervalSchema = z
    .number()
    .refine((value) => reminderIntervalHoursOptions.some((option) => option === value), { error: "invalidInterval" });

export const reminderSchema = z
    .object({
        reminderIntervalHours: reminderIntervalSchema,
        reminderWindowStart: reminderTimeSchema,
        reminderWindowEnd: reminderTimeSchema,
    })
    .refine(
        ({ reminderWindowEnd, reminderWindowStart }) => {
            const start = parseReminderTime(reminderWindowStart);
            const end = parseReminderTime(reminderWindowEnd);

            if (start == null || end == null) {
                return true;
            }

            return end.totalMinutes >= start.totalMinutes;
        },
        {
            error: "endBeforeStart",
            path: ["reminderWindowEnd"],
        },
    );
