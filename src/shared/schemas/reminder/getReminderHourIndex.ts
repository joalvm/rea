import { parseReminderTime } from "./parseReminderTime";

export function getReminderHourIndex(value: string, fallbackValue: string): number {
    const parsed = parseReminderTime(value) ?? parseReminderTime(fallbackValue);

    return parsed?.hours ?? 0;
}
