import { CycleSnapshot, PhaseKey, PredictionConfidence } from "@/types/cycle.types";
import { AppSettings } from "@/types/settings.types";

/** Devuelve label legible para origen de snapshot. */
export function getSourceLabel(source: CycleSnapshot["source"]) {
    if (source === "observed") {
        return "Observado";
    }

    if (source === "estimated") {
        return "Estimado";
    }

    return "Sin datos";
}

/** Devuelve label legible para nivel de confianza. */
export function getConfidenceLabel(confidence: PredictionConfidence) {
    if (confidence === "high") {
        return "Confianza alta";
    }

    if (confidence === "medium") {
        return "Confianza media";
    }

    return "Confianza baja";
}

/** Explica por qué snapshot tiene cierto nivel de confianza. */
export function getConfidenceNote(
    settings: AppSettings | null,
    confidence: PredictionConfidence,
    observedCycleCount: number,
) {
    if (settings?.hormonalContraception) {
        return "Con anticonceptivos hormonales priorizamos lo observado y bajamos confianza del calendario.";
    }

    if (confidence === "high") {
        return `Base fuerte: ${observedCycleCount} ciclos observados recientes.`;
    }

    if (confidence === "medium") {
        return `Base mixta: ${observedCycleCount} ciclos observados y tu configuracion inicial.`;
    }

    return observedCycleCount <= 1
        ? "Base inicial con tus primeros registros."
        : `Base parcial: ${observedCycleCount} ciclos observados recientes.`;
}

/** Describe rango esperado para siguiente periodo. */
export function getNextPeriodLabel(
    nextPeriodInDays: number,
    variabilityDays: number,
    confidence: PredictionConfidence,
    source: CycleSnapshot["source"],
) {
    if (source === "unknown") {
        return "Sin rango claro";
    }

    if (confidence === "high" && variabilityDays <= 2) {
        return `En ${nextPeriodInDays} días`;
    }

    const halfRange = Math.max(1, Math.ceil(variabilityDays / 2));
    const start = Math.max(1, nextPeriodInDays - halfRange);
    const end = nextPeriodInDays + halfRange;
    return `Entre ${start} y ${end} días`;
}

/** Describe estado visible de ventana fértil. */
export function getFertilityStatusLabel(
    cycleDay: number,
    fertileStart: number,
    cycleLength: number,
    phase: PhaseKey,
    fertilityVisible: boolean,
    _confidence: PredictionConfidence,
    settings: AppSettings | null,
) {
    if (!fertilityVisible) {
        return settings?.hormonalContraception ? "Oculta" : "No priorizada";
    }

    if (phase === "fertile") {
        return "Ahora";
    }

    const daysToFertility = getDaysToFertility(cycleDay, fertileStart, cycleLength);
    return `En ${daysToFertility} días`;
}

function getDaysToFertility(cycleDay: number, fertileStart: number, cycleLength: number) {
    if (cycleDay < fertileStart) {
        return fertileStart - cycleDay;
    }

    return cycleLength - cycleDay + fertileStart;
}
