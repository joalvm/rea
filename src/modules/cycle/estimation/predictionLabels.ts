import { CycleSnapshot, PhaseKey, PhaseSource, PredictionConfidence } from "@/types/cycle.types";
import { AppSettings } from "@/types/settings.types";

interface ConfidenceNoteContext {
    observedBleedingToday: boolean;
    observedInputToday: boolean;
    source: CycleSnapshot["source"];
}

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

/** Devuelve label legible para base actual de la fase mostrada. */
export function getPhaseSourceLabel(source: PhaseSource) {
    if (source === "observed_signals") {
        return "Observado hoy";
    }

    if (source === "history_anchor") {
        return "Historial reciente";
    }

    return "Configuración inicial";
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
    { observedBleedingToday, observedInputToday, source }: ConfidenceNoteContext,
) {
    if (observedBleedingToday) {
        return settings?.hormonalContraception
            ? "Hoy manda sangrado observado. Con anticonceptivos priorizamos eso y no el calendario."
            : "Hoy esta lectura se apoya en sangrado observado.";
    }

    if (settings?.hormonalContraception) {
        return observedInputToday
            ? "Hoy hay señales observadas. Con anticonceptivos priorizamos eso y bajamos ambición del calendario."
            : "Con anticonceptivos hormonales priorizamos lo observado y bajamos confianza del calendario.";
    }

    if (observedInputToday) {
        if (source === "unknown") {
            return "Hay señales observadas hoy, pero todavía falta historial para ubicarlas mejor en tu ciclo.";
        }

        return confidence === "low"
            ? "Hay señales observadas hoy, pero todavía no alcanzan para confirmar fase sin más historial."
            : "Hay señales observadas hoy. La lectura ya no depende solo del calendario.";
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
