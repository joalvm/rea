import { useEffect, useState } from "react";
import type { NotificationResponse } from "expo-notifications";

import { loadNotificationsModule } from "./expoNotificationsAdapter";

/**
 * Lee el ultimo tap de notificacion sin cargar Expo Notifications en Expo Go.
 * El hook conserva el contrato de Expo: undefined durante la carga y null sin
 * una respuesta disponible.
 */
export function useLastNotificationResponse(): NotificationResponse | null | undefined {
    const [response, setResponse] = useState<NotificationResponse | null | undefined>(undefined);

    useEffect(() => {
        let active = true;
        let removeSubscription: (() => void) | null = null;

        void loadNotificationsModule().then((notifications) => {
            if (!active) return;
            if (!notifications) {
                setResponse(null);
                return;
            }

            try {
                setResponse(notifications.getLastNotificationResponse());
                const subscription = notifications.addNotificationResponseReceivedListener(setResponse);
                removeSubscription = () => subscription.remove();
            } catch {
                setResponse(null);
            }
        });

        return () => {
            active = false;
            removeSubscription?.();
        };
    }, []);

    return response;
}
