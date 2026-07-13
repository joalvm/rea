import type { CheckinDetail } from "../services/listCheckinsOfDay";

/**
 * Mini-resumen de un día calculado en memoria a partir de los detalles de los
 * check-ins del día. **No** consulta la tabla `daily_summary` (Plan 07): es una
 * agregación ligera pensada para el detalle del diario, con redondeo a 1 decimal.
 */
export type DaySummary = {
    /** Promedio de `mood` (1-5) sobre los check-ins con `mood` no nulo. */
    moodAvg: number | null;
    /** Promedio de `energy` (1-5) sobre los check-ins con `energy` no nulo. */
    energyAvg: number | null;
    /** Suma de síntomas distintos a lo largo del día. */
    symptomCount: number;
    /** Suma de medicamentos a lo largo del día. */
    medicationCount: number;
    /** Intensidad máxima de sangrado (0-4) del día. */
    bleedingMax: number | null;
};

function avg(values: number[]): number | null {
    if (values.length === 0) {
        return null;
    }
    const sum = values.reduce((acc, v) => acc + v, 0);
    return Math.round((sum / values.length) * 10) / 10;
}

/**
 * Calcula el mini-resumen del día. Sobre un array vacío devuelve todos los
 * contadores a 0 y los promedios a `null`.
 */
export function summarizeDay(details: CheckinDetail[]): DaySummary {
    const moods: number[] = [];
    const energies: number[] = [];
    const bleedings: number[] = [];
    let symptomCount = 0;
    let medicationCount = 0;

    for (const detail of details) {
        if (detail.mood != null) {
            moods.push(detail.mood);
        }
        if (detail.energy != null) {
            energies.push(detail.energy);
        }
        if (detail.bleedingIntensity != null) {
            bleedings.push(detail.bleedingIntensity);
        }
        symptomCount += detail.symptoms.length;
        medicationCount += detail.medications.length;
    }

    return {
        moodAvg: avg(moods),
        energyAvg: avg(energies),
        symptomCount,
        medicationCount,
        bleedingMax: bleedings.length > 0 ? Math.max(...bleedings) : null,
    };
}
