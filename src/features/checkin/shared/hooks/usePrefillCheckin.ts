import { useEffect, useState } from "react";

import { useDatabase } from "@/db/useDatabase";
import { useLocalProfile } from "@/domain/hooks/useLocalProfile";

import { getLastCheckinOfDay } from "../services/getLastCheckinOfDay";
import { useCheckinStore } from "../stores/useCheckinStore";

function todayLocalISO(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/**
 * Precarga el draft del wizard con los valores del último check-in del día
 * (Fase 4: punto de partida al reabrir). Al montar, busca el check-in más
 * reciente de hoy para el perfil activo:
 *
 * - Si existe → `hydrate(snapshot)` para que el wizard arranque con esos valores.
 * - Si no existe → `reset()` para arrancar limpio.
 *
 * Expone `hasTodayCheckin` para que el intro muestre un indicador de
 * "continuando tu registro de hoy".
 */
export function usePrefillCheckin(): { hasTodayCheckin: boolean; loading: boolean } {
    const database = useDatabase();
    const { profile } = useLocalProfile();
    const hydrate = useCheckinStore((state) => state.hydrate);
    const reset = useCheckinStore((state) => state.reset);
    const editingId = useCheckinStore((state) => state.editingId);

    const [hasTodayCheckin, setHasTodayCheckin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            // Modo edición: la ruta `checkin/edit/[id]` ya hidrató el borrador.
            // No tocamos el store para no pisar los valores cargados.
            if (editingId !== null) {
                setLoading(false);
                return;
            }

            if (!profile) {
                if (!cancelled) {
                    setLoading(false);
                }
                return;
            }

            setLoading(true);
            try {
                const snapshot = await getLastCheckinOfDay(database, {
                    profileId: profile.id,
                    localDate: todayLocalISO(),
                });
                if (cancelled) {
                    return;
                }
                if (snapshot) {
                    hydrate(snapshot);
                    setHasTodayCheckin(true);
                } else {
                    reset();
                    setHasTodayCheckin(false);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [database, profile, hydrate, reset, editingId]);

    return { hasTodayCheckin, loading };
}
