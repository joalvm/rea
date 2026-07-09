import type { OvulationBasis } from "@/db/enums/cycleRecord";

/**
 * Ciclo derivado de rachas de periodo consecutivas: inicio de regla al día anterior
 * al siguiente inicio. `deriveCycles` produce estos campos con `ovulationDate`/
 * `ovulationBasis`/`lutealLength` en `null` (no tiene esa evidencia); el motor
 * (Fase 3) los completa al cerrar un ciclo y los persiste en `cycle_records` —
 * las lecturas históricas que vuelven a entrar a `cycleStats` ya los traen.
 *
 * Un ciclo **abierto** (sin siguiente inicio todavía) tiene `endDate`/`cycleLength`
 * en `null` e `isValid` en `true` por defecto (aún no hay nada que invalidar).
 */
export type CycleWindow = {
    startDate: string;
    endDate: string | null;
    periodLength: number | null;
    cycleLength: number | null;
    isValid: boolean;
    excludedReason: string | null;
    ovulationDate: string | null;
    ovulationBasis: OvulationBasis | null;
    lutealLength: number | null;
};
