import { addDays } from "./utils/addDays";
import type { CheckinFact } from "./types/CheckinFact";
import type { OvulationEstimate } from "./types/OvulationEstimate";

const BBT_PRIOR_WINDOW_SIZE = 6;
const BBT_SUSTAINED_RISE_SIZE = 3;
/** Valor más alto de la escala 0-4 de `cervical_mucus`: consistencia clara de huevo. */
const PEAK_CERVICAL_MUCUS_VALUE = 4;

/**
 * Estima la ovulación de un ciclo con la jerarquía de evidencia del motor:
 * BBT confirmada (regla 3-sobre-6) > OPK positivo (+1 día) > moco pico (mismo día)
 * > calendario (próximo inicio − lútea). El nivel de calendario siempre resuelve
 * en cuanto se conoce el siguiente inicio (real o predicho), así que esta función
 * nunca devuelve "sin ovulación" — jamás se inventa evidencia, pero siempre hay un
 * supuesto de calendario como piso.
 */
export function estimateOvulation(input: {
    cycleStartDate: string;
    expectedOrActualNextStartDate: string;
    checkins: CheckinFact[];
    lutealLength: number;
}): OvulationEstimate {
    const checkinsInCycle = input.checkins
        .filter(
            (checkin) =>
                checkin.localDate >= input.cycleStartDate && checkin.localDate < input.expectedOrActualNextStartDate,
        )
        .sort((a, b) => (a.localDate < b.localDate ? -1 : a.localDate > b.localDate ? 1 : 0));

    const bbtDate = findBbtConfirmedOvulationDate(checkinsInCycle);
    if (bbtDate !== null) {
        return { ovulationDate: bbtDate, ovulationBasis: "bbt" };
    }

    const opkDate = findOpkConfirmedOvulationDate(checkinsInCycle);
    if (opkDate !== null) {
        return { ovulationDate: opkDate, ovulationBasis: "opk" };
    }

    const mucusDate = findMucusPeakOvulationDate(checkinsInCycle);
    if (mucusDate !== null) {
        return { ovulationDate: mucusDate, ovulationBasis: "mucus" };
    }

    return {
        ovulationDate: addDays(input.expectedOrActualNextStartDate, -input.lutealLength),
        ovulationBasis: "calendar",
    };
}

/**
 * Regla 3-sobre-6: confirma en la primera racha de 3 temperaturas seguidas por
 * encima del máximo de las 6 previas. La ovulación se marca el día anterior a la
 * primera de esas 3 (el día en que empieza la subida sostenida).
 */
function findBbtConfirmedOvulationDate(checkins: CheckinFact[]): string | null {
    const readings = checkins.filter(
        (checkin): checkin is CheckinFact & { basalBodyTempC: number } => checkin.basalBodyTempC !== null,
    );

    for (let index = BBT_PRIOR_WINDOW_SIZE; index <= readings.length - BBT_SUSTAINED_RISE_SIZE; index++) {
        const priorWindow = readings.slice(index - BBT_PRIOR_WINDOW_SIZE, index);
        const maxPriorTemp = Math.max(...priorWindow.map((reading) => reading.basalBodyTempC));
        const sustainedRise = readings.slice(index, index + BBT_SUSTAINED_RISE_SIZE);
        const risingStartReading = readings[index];

        if (risingStartReading && sustainedRise.every((reading) => reading.basalBodyTempC > maxPriorTemp)) {
            return addDays(risingStartReading.localDate, -1);
        }
    }

    return null;
}

/** OPK positivo: la ovulación se marca aproximadamente 1 día después del primer positivo. */
function findOpkConfirmedOvulationDate(checkins: CheckinFact[]): string | null {
    const firstPositive = checkins.find((checkin) => checkin.opkResult === "positive");
    return firstPositive ? addDays(firstPositive.localDate, 1) : null;
}

/** Moco pico (clara de huevo): la ovulación se marca el mismo día del último pico registrado. */
function findMucusPeakOvulationDate(checkins: CheckinFact[]): string | null {
    const peakDays = checkins.filter((checkin) => checkin.cervicalMucus === PEAK_CERVICAL_MUCUS_VALUE);
    const lastPeakDay = peakDays.at(-1);
    return lastPeakDay ? lastPeakDay.localDate : null;
}
