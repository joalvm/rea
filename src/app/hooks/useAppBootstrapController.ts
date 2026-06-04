import { useCallback, useEffect } from "react";

import useSettingsStore from "../../modules/state/useSettingsStore";
import useAppStore from "../../modules/state/useAppStore";
import { NotificationCadence } from "../../types/notifications.types";
import { AppSettings } from "../../types/settings.types";

/** Contrato de salida de useAppBootstrapController para consumidores del shell raíz. */
export interface UseAppBootstrapControllerResult {
    /** Ajustes base de usuaria cargados desde store. */
    settings: AppSettings | null;
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
}

/** Encapsula bootstrap raíz y estado mínimo usado por shell principal. */
export default function useAppBootstrapController(): UseAppBootstrapControllerResult {
    const { notificationCadence, settings } = useSettingsStore();
    const loading = useAppStore((state) => state.loading);
    const bootstrap = useAppStore((state) => state.bootstrap);
    const refreshAppStoreData = useAppStore((state) => state.refreshData);
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
        await refreshAppStoreData();
    }, [refreshAppStoreData]);

    return {
        loading,
        notificationCadence,
        refreshData,
        replaceNotificationCadence,
        resetData,
        settings,
    };
}
