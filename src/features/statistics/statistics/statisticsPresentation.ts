import type { TFunction } from "i18next";

/** Texto de gate para no presentar una estadística como concluyente con poca historia. */
export function getStatisticsGateText(validCycles: number, missingCycles: number, t: TFunction<"statistics">): string {
    return validCycles >= 3 ? `${validCycles} ${t("cycles")}` : t("notEnough", { count: missingCycles });
}

/** Convierte una señal de 0..5 en una altura de barra legible y estable. */
export function getStatisticsBarHeight(value: number | null): number {
    return value === null ? 4 : Math.max(4, Math.round(value * 8));
}
