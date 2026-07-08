import type { ContraceptionMethod, ReproductiveMode } from "@/db/enums/reproductiveMode";

/**
 * Hecho mínimo de intención reproductiva vigente que necesita el algoritmo puro de
 * ciclo: modo (gobierna pausa/ventana fértil), método anticonceptivo (supresión
 * hormonal), lactancia (supresión posparto) y longitudes declaradas (prior antes de
 * tener historia de ciclos).
 */
export type ReproductiveIntentFact = {
    effectiveFrom: string;
    effectiveTo: string | null;
    reproductiveMode: ReproductiveMode;
    contraceptionMethod: ContraceptionMethod | null;
    breastfeeding: boolean | null;
    declaredCycleLength: number | null;
    declaredPeriodLength: number | null;
};
