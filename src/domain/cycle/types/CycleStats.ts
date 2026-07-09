/**
 * Estadísticas de la ventana de aprendizaje (últimos 6 ciclos válidos) que produce
 * `cycleStats`. `lutealLengthMedian`/`bbtConfirmedOvulationCount` solo consideran
 * ciclos con `ovulationBasis === 'bbt'` — la única evidencia lo bastante confiable
 * para personalizar la fase lútea.
 */
export type CycleStats = {
    sampleSize: number;
    cycleLengthMedian: number | null;
    cycleLengthSigma: number;
    periodLengthMedian: number | null;
    lutealLengthMedian: number | null;
    bbtConfirmedOvulationCount: number;
};
