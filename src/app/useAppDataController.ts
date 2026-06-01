import { useCallback, useEffect, useMemo, useState } from "react";

import estimateCycle from "../modules/cycle/estimation/estimateCycle";
import createDefaultNotificationMoments from "../modules/notifications/defaults/createDefaultNotificationMoments";
import initializeDatabase from "../modules/storage/core/schema";
import loadAppData from "../modules/storage/services/loadAppData";
import { AppData } from "../types/app.types";
import { NotificationMoment } from "../types/notifications.types";
import { initialData } from "./app-shell.types";

interface UseAppDataControllerResult {
    /** Snapshot completo de datos persistidos cargados en shell. */
    data: AppData;
    /** Indica si bootstrap raíz sigue corriendo. */
    loading: boolean;
    /** Momentos de notificación listos para consumir en UI. */
    moments: NotificationMoment[];
    /** Recarga datos persistidos desde almacenamiento local. */
    refreshData: () => Promise<void>;
    /** Actualiza sólo momentos en snapshot actual sin recarga completa. */
    replaceNotificationMoments: (notificationMoments: NotificationMoment[]) => void;
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

    const replaceNotificationMoments = useCallback((notificationMoments: NotificationMoment[]) => {
        setData((current) => ({ ...current, notificationMoments }));
    }, []);

    const resetData = useCallback(() => {
        setLoading(false);
        setData(initialData);
    }, []);

    const snapshot = useMemo(
        () => estimateCycle(data.settings, data.cycles, data.dailyLogs),
        [data.cycles, data.dailyLogs, data.settings],
    );
    const moments = useMemo(
        () => (data.notificationMoments.length > 0 ? data.notificationMoments : createDefaultNotificationMoments()),
        [data.notificationMoments],
    );

    return {
        data,
        loading,
        moments,
        refreshData,
        replaceNotificationMoments,
        resetData,
        snapshot,
    };
}

/** Rehidrata defaults locales para que shell siempre tenga momentos utilizables. */
function normalizeAppData(loaded: AppData): AppData {
    return {
        ...loaded,
        notificationMoments:
            loaded.notificationMoments.length > 0 ? loaded.notificationMoments : createDefaultNotificationMoments(),
    };
}
