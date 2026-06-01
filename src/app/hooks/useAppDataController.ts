import { useCallback, useEffect, useMemo, useState } from "react";

import estimateCycle from "../../modules/cycle/estimation/estimateCycle";
import createDefaultNotificationCadence from "../../modules/notifications/defaults/createDefaultNotificationCadence";
import initializeDatabase from "../../modules/storage/core/schema";
import loadAppData from "../../modules/storage/services/loadAppData";
import { AppData } from "../../types/app.types";
import { NotificationCadence } from "../../types/notifications.types";
import { initialData } from "../app-shell.types";

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
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AppData>(initialData);

    const boot = useCallback(async () => {
        await initializeDatabase();
        const loaded = await loadAppData();
        setData(normalizeAppData(loaded));
        setLoading(false);
    }, []);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            void boot();
        });

        return () => cancelAnimationFrame(frame);
    }, [boot]);

    const refreshData = useCallback(async () => {
        const loaded = await loadAppData();
        setData(normalizeAppData(loaded));
    }, []);

    const replaceNotificationCadence = useCallback((notificationCadence: NotificationCadence) => {
        setData((current) => ({ ...current, notificationCadence }));
    }, []);

    const resetData = useCallback(() => {
        setLoading(false);
        setData(initialData);
    }, []);

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

/** Rehidrata defaults locales para que shell siempre tenga momentos utilizables. */
function normalizeAppData(loaded: AppData): AppData {
    return {
        ...loaded,
        notificationCadence: loaded.notificationCadence ?? createDefaultNotificationCadence(),
    };
}
