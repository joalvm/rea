import type * as Notifications from "expo-notifications";

import { canUseLocalNotifications } from "./notificationRuntime";

type NotificationsModule = typeof Notifications;

let notificationsModulePromise: Promise<NotificationsModule | null> | null = null;

/**
 * Carga Expo Notifications solo en un development build.
 * Expo Go no incluye el soporte Android necesario y su importación estática
 * puede romper la validación de rutas de Expo Router.
 */
export function loadNotificationsModule(): Promise<NotificationsModule | null> {
    if (!canUseLocalNotifications()) {
        return Promise.resolve(null);
    }

    notificationsModulePromise ??= Promise.resolve()
        // Expo Go puede lanzar al evaluar el módulo; la carga debe poder fallar sin tumbar la app.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        .then(() => require("expo-notifications") as NotificationsModule)
        .catch(() => null);
    return notificationsModulePromise;
}
