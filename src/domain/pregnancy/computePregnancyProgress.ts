import { addDaysToISO } from "@/shared/utils/ymd";

export type PregnancyProgress = {
    week: number;
    day: number;
    trimester: 1 | 2 | 3;
    daysRemaining: number;
    isBeyondDueDate: boolean;
};

const DAYS_IN_PREGNANCY = 280;
const DAYS_IN_WEEK = 7;

export function computePregnancyProgress(lmpDate: string, today: string): PregnancyProgress {
    const elapsedDays = Math.max(0, differenceInDays(lmpDate, today));
    const week = Math.floor(elapsedDays / DAYS_IN_WEEK) + 1;
    const day = elapsedDays % DAYS_IN_WEEK;
    const trimester: 1 | 2 | 3 = week <= 13 ? 1 : week <= 27 ? 2 : 3;
    const dueDate = addDaysToISO(lmpDate, DAYS_IN_PREGNANCY);

    return {
        week,
        day,
        trimester,
        daysRemaining: Math.max(0, differenceInDays(today, dueDate)),
        isBeyondDueDate: today > dueDate,
    };
}

function differenceInDays(from: string, to: string): number {
    const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
    const [toYear, toMonth, toDay] = to.split("-").map(Number);
    const fromTime = Date.UTC(fromYear ?? 1970, (fromMonth ?? 1) - 1, fromDay ?? 1);
    const toTime = Date.UTC(toYear ?? 1970, (toMonth ?? 1) - 1, toDay ?? 1);
    return Math.round((toTime - fromTime) / (24 * 60 * 60 * 1000));
}
