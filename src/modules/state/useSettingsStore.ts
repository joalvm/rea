import { useMemo } from "react";

import createDefaultNotificationCadence from "@/modules/notifications/defaults/createDefaultNotificationCadence";

import useAppStore from "./useAppStore";

/** Expone ajustes de Rea desde Zustand; no persiste ni consulta SQLite desde UI. */
export default function useSettingsStore() {
    const settings = useAppStore((state) => state.data.settings);
    const storedNotificationCadence = useAppStore((state) => state.data.notificationCadence);
    const notificationCadence = useMemo(
        () => storedNotificationCadence ?? createDefaultNotificationCadence(),
        [storedNotificationCadence],
    );

    return {
        notificationCadence,
        settings,
    };
}
