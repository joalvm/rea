import { useEffect } from "react";

import { logCheckinStep } from "./checkinMetrics";

/**
 * Registra la visita a un paso del wizard al montar la pantalla. Solo activo en
 * `__DEV__` (dentro de `logCheckinStep`). Se usa para medir los presupuestos de
 * tiempo de la Fase 4 durante el QA.
 *
 * @param step Identificador del paso (ej. "bleeding", "feelings").
 */
export function useCheckinStepMetric(step: string): void {
    useEffect(() => {
        logCheckinStep(step);
    }, [step]);
}
