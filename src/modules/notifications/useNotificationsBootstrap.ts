import { useEffect } from "react";

import { useDatabase } from "@/db/useDatabase";

import { notificationCopyResolver } from "./copyResolver";
import { reprogramAll } from "./reprogramAll";

/**
 * Reprograma las notificaciones al montar desde `app/_layout.tsx`.
 * Cumple el horizonte rodante del plan 12: cada apertura de app re-extiende los
 * pendientes y corrige cualquier cambio de configuración o predicción que
 * hubiera pasado mientras la app estuvo cerrada. Idempotente por construcción.
 *
 * Best-effort: si el permiso no está concedido, `reprogramAll` cancela todo y
 * no programa nada; la pantalla de Ajustes seguirá ofreciendo re-intento.
 */
export function useNotificationsBootstrap() {
    const database = useDatabase();

    useEffect(() => {
        reprogramAll(database, { resolveCopy: notificationCopyResolver() }).catch(() => {
            // El bootstrap nunca rompe la app: si falla, la próxima apertura
            // vuelve a intentarlo.
        });
    }, [database]);
}
