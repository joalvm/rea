import {
    isHormonalContraceptionMethod,
    type ContraceptionMethod,
    type ReproductiveMode,
} from "@/db/enums/reproductiveMode";

import { addDays } from "./utils/addDays";
import type { FertileWindowResult } from "./types/FertileWindowResult";

const AVOID_MODE_WINDOW_BEFORE = 7;
const AVOID_MODE_WINDOW_AFTER = 2;
const DEFAULT_WINDOW_BEFORE = 5;
const DEFAULT_WINDOW_AFTER = 1;

/**
 * Calcula la ventana fértil con precedencia hormonal > lactancia > sin-ovulación >
 * calculada. Hormonal suprime ovulación **y** ventana (ambas honestamente NULL);
 * lactancia suprime **solo** la ventana (la ovulación sigue visible en otro lado).
 * En modo evitar el marco es conservador (−7…+2); en el resto, −5…+1.
 */
export function fertileWindow(input: {
    ovulationDate: string | null;
    mode: ReproductiveMode;
    contraceptionMethod: ContraceptionMethod | null;
    breastfeeding: boolean | null;
}): FertileWindowResult {
    if (isHormonalContraceptionMethod(input.contraceptionMethod)) {
        return { start: null, end: null, suppressed: true, suppressedReason: "hormonal_contraception" };
    }

    if (input.breastfeeding) {
        return { start: null, end: null, suppressed: true, suppressedReason: "breastfeeding" };
    }

    if (input.ovulationDate === null) {
        return { start: null, end: null, suppressed: true, suppressedReason: "no_ovulation" };
    }

    const isAvoidMode = input.mode === "tracking_avoid_pregnancy";
    const daysBefore = isAvoidMode ? AVOID_MODE_WINDOW_BEFORE : DEFAULT_WINDOW_BEFORE;
    const daysAfter = isAvoidMode ? AVOID_MODE_WINDOW_AFTER : DEFAULT_WINDOW_AFTER;

    return {
        start: addDays(input.ovulationDate, -daysBefore),
        end: addDays(input.ovulationDate, daysAfter),
        suppressed: false,
        suppressedReason: null,
    };
}
