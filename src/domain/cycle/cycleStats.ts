import { median } from "./utils/median";
import { standardDeviation } from "./utils/standardDeviation";
import type { CycleStats } from "./types/CycleStats";
import type { CycleWindow } from "./types/CycleWindow";

const LEARNING_WINDOW_SIZE = 6;

/**
 * Estadísticas de la ventana de aprendizaje: mediana y σ de longitud de ciclo y
 * periodo sobre los últimos 6 ciclos válidos (los más recientes por `startDate`).
 * `lutealLengthMedian`/`bbtConfirmedOvulationCount` solo miran ciclos con
 * `ovulationBasis === 'bbt'`, la única evidencia confiable para personalizar la
 * fase lútea (ver Decisiones base del plan 01).
 */
export function cycleStats(cycles: CycleWindow[]): CycleStats {
    const validCycles = cycles.filter((cycle) => cycle.isValid && cycle.cycleLength !== null);

    const learningWindow = [...validCycles]
        .sort((a, b) => (a.startDate > b.startDate ? -1 : a.startDate < b.startDate ? 1 : 0))
        .slice(0, LEARNING_WINDOW_SIZE);

    const cycleLengths = learningWindow.map((cycle) => cycle.cycleLength as number);
    const periodLengths = learningWindow
        .filter((cycle) => cycle.periodLength !== null)
        .map((cycle) => cycle.periodLength as number);
    const bbtConfirmedCycles = learningWindow.filter((cycle) => cycle.ovulationBasis === "bbt");
    const lutealLengths = bbtConfirmedCycles
        .filter((cycle) => cycle.lutealLength !== null)
        .map((cycle) => cycle.lutealLength as number);

    return {
        sampleSize: learningWindow.length,
        cycleLengthMedian: cycleLengths.length > 0 ? median(cycleLengths) : null,
        cycleLengthSigma: standardDeviation(cycleLengths),
        periodLengthMedian: periodLengths.length > 0 ? median(periodLengths) : null,
        lutealLengthMedian: lutealLengths.length > 0 ? median(lutealLengths) : null,
        bbtConfirmedOvulationCount: bbtConfirmedCycles.length,
    };
}
