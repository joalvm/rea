import { CycleSnapshot, PhaseKey, PredictionConfidence } from "@/types/cycle.types";
import { AppSettings } from "@/types/settings.types";

import { findLastOnOrBefore } from "../../utils/cycleObservedData.utils";

interface PhaseMessageContext {
    phase: PhaseKey;
    source: CycleSnapshot["source"];
    confidence: PredictionConfidence;
    nextPeriodInDays: number;
    fertilityVisible: boolean;
    settings: AppSettings | null;
}

/** Determina fase estimada a partir del día de ciclo y reglas visibles. */
export function getPhase(
    cycleDay: number,
    periodLength: number,
    fertileStart: number,
    fertileEnd: number,
    fertilityVisible: boolean,
    isObservedBleeding: boolean,
): PhaseKey {
    if (isObservedBleeding) {
        return "menstrual";
    }

    if (cycleDay <= periodLength) {
        return "menstrual";
    }

    if (fertilityVisible && cycleDay >= fertileStart && cycleDay <= fertileEnd) {
        return "fertile";
    }

    if (cycleDay < fertileStart) {
        return "follicular";
    }

    return "luteal";
}

/** Redacta mensaje principal del snapshot actual del ciclo. */
export function getPhaseMessage({
    phase,
    source,
    confidence,
    nextPeriodInDays,
    fertilityVisible,
    settings,
}: PhaseMessageContext): string {
    if (settings?.hormonalContraception) {
        return "Con anticonceptivos hormonales esta vista es orientativa. Priorizamos tus registros sobre calendario.";
    }

    if (source === "unknown") {
        return "Base inicial. Marca periodos reales para pasar de referencia suave a seguimiento mas confiable.";
    }

    if (confidence === "low") {
        return "Todavía depende bastante de tu fecha inicial. Cuantos más periodos reales marques, mejor ajusta.";
    }

    switch (phase) {
        case "menstrual":
            return source === "observed"
                ? "Hoy cuenta como observación real de sangrado. Úsalo para ajustar mejor tu ciclo."
                : "Esta etapa se sigue comparando contra tus registros. Flujo, dolor y energía ayudan a afinarla.";
        case "follicular":
            return "Etapa de recuperación orientativa. Lo útil aquí es comparar energía, sueño y ánimo con tus registros.";
        case "fertile":
            return fertilityVisible
                ? "Ventana fértil orientativa. Si buscas precisión, combina señales reales como moco cervical, temperatura o test."
                : "Seguimos mostrando referencia de ciclo, pero no una ventana fértil activa en este modo.";
        case "luteal":
            return `Próxima regla estimada en ${nextPeriodInDays} días. Observa sueño, ánimo y estrés para comparar este tramo.`;
    }
}

/** Decide si la base del snapshot es observada, estimada o desconocida. */
export function getSnapshotSource(
    observedBleedingDates: Set<string>,
    observedStarts: string[],
    todayIso: string,
): CycleSnapshot["source"] {
    if (observedBleedingDates.has(todayIso)) {
        return "observed";
    }

    if (findLastOnOrBefore(observedStarts, todayIso)) {
        return "estimated";
    }

    return "unknown";
}

/** Resume confianza de predicción según datos y regularidad declarada. */
export function getPredictionConfidence(
    settings: AppSettings | null,
    observedCycleCount: number,
    measuredCycleCount: number,
): PredictionConfidence {
    if (settings?.hormonalContraception) {
        return "low";
    }

    let score = 0;
    if (measuredCycleCount >= 3) {
        score += 2;
    } else if (measuredCycleCount >= 1) {
        score += 1;
    }

    if (observedCycleCount >= 3) {
        score += 1;
    }

    if (settings?.regularity === "variable") {
        score -= 1;
    }

    if (settings?.regularity === "irregular") {
        score -= 2;
    }

    if (score >= 3) {
        return "high";
    }

    if (score >= 1) {
        return "medium";
    }

    return "low";
}

/** Estima margen esperado de variación para próxima regla. */
export function getVariabilityDays(values: number[], settings: AppSettings | null) {
    if (values.length >= 2) {
        return Math.max(...values) - Math.min(...values);
    }

    if (settings?.regularity === "irregular") {
        return 6;
    }

    if (settings?.regularity === "variable") {
        return 4;
    }

    return 2;
}
