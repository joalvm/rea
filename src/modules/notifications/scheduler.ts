import type { NotificationContentInput } from "expo-notifications";

import { loadNotificationsModule } from "./expoNotificationsAdapter";

/**
 * Adaptador fino sobre el scheduler de `expo-notifications`. La carga nativa se
 * delega a `expoNotificationsAdapter`, para que el resto del código dependa de
 * esta interfaz y sea fácil de testear (basta mockear este archivo).
 *
 * Los identifiers son estables por slot, así que reprogramar es idempotente:
 * cancelar todo + reprogramar produce el mismo set de pendientes.
 */
export async function cancelAllScheduled(): Promise<void> {
    const notifications = await loadNotificationsModule();
    if (!notifications) return;

    await notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleDaily(params: {
    identifier: string;
    hour: number;
    minute: number;
    content: NotificationContentInput;
}): Promise<void> {
    const notifications = await loadNotificationsModule();
    if (!notifications) return;

    await notifications.scheduleNotificationAsync({
        identifier: params.identifier,
        content: params.content,
        trigger: {
            type: notifications.SchedulableTriggerInputTypes.DAILY,
            hour: params.hour,
            minute: params.minute,
        },
    });
}
