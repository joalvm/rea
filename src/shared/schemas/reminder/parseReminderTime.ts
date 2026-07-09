import { reminderTimeSchema } from "./reminderTimeSchema";

type ReminderTime = {
    hours: number;
    minutes: number;
    totalMinutes: number;
};

export function parseReminderTime(value: string): ReminderTime | null {
    const result = reminderTimeSchema.safeParse(value);

    if (!result.success) {
        return null;
    }

    const [hoursPart, minutesPart] = result.data.split(":");
    const hours = Number(hoursPart);
    const minutes = Number(minutesPart);

    return {
        hours,
        minutes,
        totalMinutes: hours * 60 + minutes,
    };
}
