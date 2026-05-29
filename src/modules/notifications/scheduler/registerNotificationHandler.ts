import { setNotificationHandler } from "expo-notifications/build/NotificationsHandler";

let notificationHandlerRegistered = false;

/** Registra handler global de notificaciones una sola vez por arranque. */
export default function registerNotificationHandler() {
    if (notificationHandlerRegistered) {
        return;
    }

    setNotificationHandler({
        handleNotification: async () => ({
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });

    notificationHandlerRegistered = true;
}
