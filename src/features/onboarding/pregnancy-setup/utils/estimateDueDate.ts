import type { YMD } from "../../shared/utils/onboardingDate";
import { ymdToISO } from "../../shared/utils/onboardingDate";

const PREGNANCY_GESTATION_DAYS = 280;

export function estimateDueDate(lmp: YMD): string {
    const date = new Date(Date.UTC(lmp.year, lmp.month - 1, lmp.day));
    date.setUTCDate(date.getUTCDate() + PREGNANCY_GESTATION_DAYS);

    return ymdToISO({
        day: date.getUTCDate(),
        month: date.getUTCMonth() + 1,
        year: date.getUTCFullYear(),
    });
}
