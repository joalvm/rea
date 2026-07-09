import { z } from "zod";

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

function isIsoDate(value: string): boolean {
    if (!isoDatePattern.test(value)) {
        return false;
    }

    const [yearPart, monthPart, dayPart] = value.split("-");
    const year = Number(yearPart);
    const month = Number(monthPart);
    const day = Number(dayPart);
    const date = new Date(Date.UTC(year, month - 1, day));

    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export const isoDateSchema = z.string().refine(isIsoDate, { error: "invalidDate" });
