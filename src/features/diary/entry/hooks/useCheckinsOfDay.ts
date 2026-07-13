import { useEffect, useState } from "react";

import { useDatabase } from "@/db/useDatabase";

import type { CheckinDetail } from "../services/listCheckinsOfDay";
import { listCheckinsOfDay } from "../services/listCheckinsOfDay";

export type UseCheckinsOfDayResult = {
    details: CheckinDetail[];
    loading: boolean;
    error: Error | null;
    /** Fuerza una recarga manual (tras borrar/restaurar). */
    reload: () => void;
};

/**
 * Carga los check-ins de un día concreto para el detalle del diario.
 *
 * A diferencia de `useCheckins` (que es reactivo vía `useLiveQuery`), este hook
 * es **no reactivo**: hace una lectura async multi-query (`listCheckinsOfDay`)
 * dentro de un `useEffect`. El motivo es que el detalle agrega 3 tablas y
 * agrupa post-query, algo que no encaja en `useLiveQuery`. Volumen bajo (un día),
 * y la pantalla se recarga al volver del wizard de check-in o al cambiar de día.
 *
 * Expone `reload()` para forzar la recarga tras una mutación local (borrar /
 * restaurar) sin esperar a que cambien las deps.
 *
 * Si `profileId` es nulo/undefined no consulta y devuelve `details: []`.
 */
export function useCheckinsOfDay(
    profileId: string | null | undefined,
    localDate: string,
): UseCheckinsOfDayResult {
    const database = useDatabase();
    const [details, setDetails] = useState<CheckinDetail[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [reloadSignal, setReloadSignal] = useState(0);

    useEffect(() => {
        if (profileId == null) {
            setDetails([]);
            setLoading(false);
            setError(null);
            return;
        }

        let active = true;
        setLoading(true);
        listCheckinsOfDay(database, { profileId, localDate })
            .then((rows) => {
                if (active) {
                    setDetails(rows);
                    setError(null);
                }
            })
            .catch((err: unknown) => {
                if (active) {
                    setError(err instanceof Error ? err : new Error(String(err)));
                }
            })
            .finally(() => {
                if (active) {
                    setLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [database, profileId, localDate, reloadSignal]);

    return { details, loading, error, reload: () => setReloadSignal((n) => n + 1) };
}
