import { useCallback, useEffect, useMemo } from "react";

import estimateCycle from "../../modules/cycle/estimation/estimateCycle";
import createDefaultNotificationCadence from "../../modules/notifications/defaults/createDefaultNotificationCadence";
import useAppStore from "../../modules/state/useAppStore";
import { AppData } from "../../types/app.types";
import { NotificationCadence } from "../../types/notifications.types";

/** Contrato de salida de useAppDataController para consumidores del shell raíz. */
export interface UseAppDataControllerResult {
    /** Snapshot completo de datos persistidos cargados en shell. */
    data: AppData;
    /** Indica si bootstrap raíz sigue corriendo. */
    loading: boolean;
    /** Momentos de notificación listos para consumir en UI. */
    notificationCadence: NotificationCadence;
    /** Recarga datos persistidos desde almacenamiento local. */
    refreshData: () => Promise<void>;
    /** Actualiza sólo momentos en snapshot actual sin recarga completa. */
    replaceNotificationCadence: (notificationCadence: NotificationCadence) => void;
    /** Limpia snapshot raíz tras reset de aplicación. */
    resetData: () => void;
    /** Resumen derivado del ciclo para superficies principales. */
    snapshot: ReturnType<typeof estimateCycle>;
}

/** Encapsula bootstrap, snapshot y fuente de datos usada por shell principal. */
export default function useAppDataController(): UseAppDataControllerResult {
    const data = useAppStore((state) => state.data);
    const loading = useAppStore((state) => state.loading);
    const bootstrap = useAppStore((state) => state.bootstrap);
    const refreshAppData = useAppStore((state) => state.refreshData);
    const replaceNotificationCadence = useAppStore((state) => state.replaceNotificationCadence);
    const resetData = useAppStore((state) => state.resetData);

    const boot = useCallback(async () => {
        await bootstrap();
    }, [bootstrap]);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            void boot();
        });

        return () => cancelAnimationFrame(frame);
    }, [boot]);

    const refreshData = useCallback(async () => {
        await refreshAppData();
    }, [refreshAppData]);

    const snapshot = useMemo(
        () => estimateCycle(data.settings, data.cycles, data.dailyLogs, undefined, data.moodCheckIns),
        [data.cycles, data.dailyLogs, data.moodCheckIns, data.settings],
    );
    const notificationCadence = useMemo(
        () => data.notificationCadence ?? createDefaultNotificationCadence(),
        [data.notificationCadence],
    );

    return {
        data,
        loading,
        notificationCadence,
        refreshData,
        replaceNotificationCadence,
        resetData,
        snapshot,
    };
}
