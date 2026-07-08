import { isHormonalContraceptionMethod } from "@/db/enums/reproductiveMode";

import { addDays } from "./utils/addDays";
import { diffInDays } from "./utils/diffInDays";
import { confidence } from "./confidence";
import { cycleStats } from "./cycleStats";
import { estimateOvulation } from "./estimateOvulation";
import { fertileWindow } from "./fertileWindow";
import type { CheckinFact } from "./types/CheckinFact";
import type { CyclePredictionResult } from "./types/CyclePredictionResult";
import type { CycleWindow } from "./types/CycleWindow";
import type { ReproductiveIntentFact } from "./types/ReproductiveIntentFact";

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;
const DEFAULT_LUTEAL_LENGTH = 14;
const MIN_VALID_CYCLES_FOR_HISTORY = 2;
const MIN_BBT_CONFIRMED_CYCLES_FOR_PERSONALIZED_LUTEAL = 3;

/**
 * Predicción del siguiente ciclo, componiendo `cycleStats` + `estimateOvulation` +
 * `fertileWindow` + `confidence`. Devuelve `null` en embarazo activo (`isPaused`) o
 * en posparto sin ancla (`!hasPostpartumAnchor`, sin regla registrada desde el
 * cierre del episodio): en ambos casos no hay base para predecir nada.
 *
 * "Retraso honesto": `predictedNextStart` es siempre `inicio del ciclo abierto +
 * longitud usada` — nunca depende de `today`, así que jamás se re-predice hacia
 * adelante solo porque pasó la fecha. Cuando `today` ya pasó esa fecha, la
 * confianza se fuerza a `low` (día de retraso, degradado).
 */
export function predictNextCycle(input: {
    today: string;
    cycles: CycleWindow[];
    intent: ReproductiveIntentFact;
    checkinsInOpenCycle: CheckinFact[];
    isPaused: boolean;
    hasPostpartumAnchor: boolean;
}): CyclePredictionResult {
    if (input.isPaused || !input.hasPostpartumAnchor) {
        return null;
    }

    const openCycle = input.cycles.find((cycle) => cycle.endDate === null);
    if (!openCycle) {
        return null;
    }

    const stats = cycleStats(input.cycles);
    const basedOnDeclaredPrior = stats.sampleSize < MIN_VALID_CYCLES_FOR_HISTORY;

    const cycleLengthUsed = basedOnDeclaredPrior
        ? (input.intent.declaredCycleLength ?? DEFAULT_CYCLE_LENGTH)
        : (stats.cycleLengthMedian ?? DEFAULT_CYCLE_LENGTH);

    const predictedPeriodLength = basedOnDeclaredPrior
        ? (input.intent.declaredPeriodLength ?? DEFAULT_PERIOD_LENGTH)
        : (stats.periodLengthMedian ?? DEFAULT_PERIOD_LENGTH);

    const lutealPhaseUsed =
        stats.bbtConfirmedOvulationCount >= MIN_BBT_CONFIRMED_CYCLES_FOR_PERSONALIZED_LUTEAL &&
        stats.lutealLengthMedian !== null
            ? stats.lutealLengthMedian
            : DEFAULT_LUTEAL_LENGTH;

    const predictedNextStart = addDays(openCycle.startDate, cycleLengthUsed);
    const isHormonal = isHormonalContraceptionMethod(input.intent.contraceptionMethod);

    // Modo hormonal: ni se intenta estimar ovulación (el método la suprime), la
    // ventana fértil hereda la supresión vía `fertileWindow`.
    const ovulation = isHormonal
        ? null
        : estimateOvulation({
              cycleStartDate: openCycle.startDate,
              expectedOrActualNextStartDate: predictedNextStart,
              checkins: input.checkinsInOpenCycle,
              lutealLength: lutealPhaseUsed,
          });

    const fertile = fertileWindow({
        ovulationDate: ovulation?.ovulationDate ?? null,
        mode: input.intent.reproductiveMode,
        contraceptionMethod: input.intent.contraceptionMethod,
        breastfeeding: input.intent.breastfeeding,
    });

    // El basis `calendar` es supuesto, no evidencia: no cuenta para confianza `high`.
    const hasOvulationEvidenceLastCycle = ovulation !== null && ovulation.ovulationBasis !== "calendar";
    const isDelayed = diffInDays(predictedNextStart, input.today) > 0;

    const confidenceLevel = isDelayed
        ? "low"
        : confidence({
              validCycleCount: stats.sampleSize,
              sigma: stats.cycleLengthSigma,
              hasOvulationEvidenceLastCycle,
          });

    return {
        predictedNextStart,
        cycleLengthUsed,
        lutealPhaseUsed,
        predictedPeriodLength,
        predictedOvulation: ovulation?.ovulationDate ?? null,
        ovulationBasis: ovulation?.ovulationBasis ?? null,
        fertileWindow: fertile,
        confidence: confidenceLevel,
        basedOnDeclaredPrior,
    };
}
