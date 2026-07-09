/**
 * Rango afectado por una escritura reciente (abrir/cerrar/editar periodo,
 * check-in, cambio de intención, episodio de embarazo). `from` es la fecha más
 * antigua del hecho que cambió — `recalculate` expande desde ahí hasta el ciclo
 * que la contiene y reproyecta hacia adelante hasta el horizonte de predicción.
 */
export type ChangedRange = {
    profileId: string;
    from: string;
};
