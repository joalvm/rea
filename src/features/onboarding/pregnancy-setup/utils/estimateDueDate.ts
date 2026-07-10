import { addDaysToISO, type YMD, ymdToISO } from "@/shared/utils/ymd";

const PREGNANCY_GESTATION_DAYS = 280;

/** Regla de Naegele: FPP estimada = FUM + 280 días. */
export function estimateDueDate(lmp: YMD): string {
    return addDaysToISO(ymdToISO(lmp), PREGNANCY_GESTATION_DAYS);
}

/** Inversa de la regla de Naegele: FUM estimada = FPP − 280 días. */
export function estimateLmpFromDueDate(due: YMD): string {
    return addDaysToISO(ymdToISO(due), -PREGNANCY_GESTATION_DAYS);
}
