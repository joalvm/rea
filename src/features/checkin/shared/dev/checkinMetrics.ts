/**
 * Métricas ligeras de pasos del wizard de check-in para medir los presupuestos
 * de tiempo de la Fase 4 (<60 s día normal, <15 s día vacío) durante el QA en
 * desarrollo.
 *
 * Solo activo en `__DEV__`. En producción todas las funciones son no-op.
 * No persiste ni envía telemetry: acumula en memoria y loguea al guardar.
 */

type StepVisit = {
    step: string;
    ts: number;
};

const visits: StepVisit[] = [];
let sessionStart: number | null = null;

/** Registra la visita a un paso del wizard (al montar la pantalla). */
export function logCheckinStep(step: string): void {
    if (!__DEV__) {
        return;
    }
    if (sessionStart === null) {
        sessionStart = Date.now();
    }
    visits.push({ step, ts: Date.now() });
}

/**
 * Loguea el resumen de la sesión de captura: pasos visitados, total y tiempo
 * transcurrido desde el primer paso. Llamar tras un guardado exitoso.
 */
export function logCheckinSummary(): void {
    if (!__DEV__) {
        return;
    }
    if (visits.length === 0 || sessionStart === null) {
        return;
    }
    const elapsedMs = Date.now() - sessionStart;
    const steps = visits.map((v) => v.step);
    const uniqueSteps = new Set(steps);
    // eslint-disable-next-line no-console
    console.debug(
        `[checkin-metrics] ${visits.length} visitas, ${uniqueSteps.size} pasos únicos, ${(elapsedMs / 1000).toFixed(1)}s total`,
        { steps },
    );
    resetCheckinMetrics();
}

/** Reinicia la sesión de métricas (al cerrar el wizard). */
export function resetCheckinMetrics(): void {
    visits.length = 0;
    sessionStart = null;
}
