import { addDays } from "./utils/addDays";
import { diffInDays } from "./utils/diffInDays";
import type { CycleWindow } from "./types/CycleWindow";
import type { PeriodRunFact } from "./types/PeriodRunFact";

const MIN_VALID_CYCLE_LENGTH = 15;
const MAX_VALID_CYCLE_LENGTH = 90;

/**
 * Deriva ciclos a partir de rachas de periodo: cada ciclo va de un inicio al día
 * anterior al siguiente. Las rachas `excluded` se filtran de las anclas antes de
 * emparejar (un sangrado excluido no corta un ciclo en dos, el ciclo sigue).
 *
 * `is_valid` es solo la regla de 15–90 días sobre ciclos ya cerrados (con
 * `cycleLength` conocido) — el ciclo abierto final (sin siguiente inicio) siempre
 * es `isValid: true`, no hay nada que invalidar todavía.
 */
export function deriveCycles(periodRuns: PeriodRunFact[]): CycleWindow[] {
    const anchors = periodRuns
        .filter((run) => run.status !== "excluded")
        .slice()
        .sort((a, b) => (a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : 0));

    return anchors.map((anchor, index) => {
        const next = anchors[index + 1];
        const cycleLength = next ? diffInDays(anchor.startDate, next.startDate) : null;
        const endDate = next ? addDays(next.startDate, -1) : null;
        const periodLength = anchor.endDate ? diffInDays(anchor.startDate, anchor.endDate) + 1 : null;

        const isValid =
            cycleLength === null || (cycleLength >= MIN_VALID_CYCLE_LENGTH && cycleLength <= MAX_VALID_CYCLE_LENGTH);

        return {
            startDate: anchor.startDate,
            endDate,
            periodLength,
            cycleLength,
            isValid,
            excludedReason: isValid ? null : "cycle_length_out_of_range",
            ovulationDate: null,
            ovulationBasis: null,
            lutealLength: null,
        };
    });
}
