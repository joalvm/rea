import * as Notifications from "expo-notifications";

/**
 * Adaptador fino sobre el scheduler de `expo-notifications`. Es el ÚNICO archivo
 * del módulo que importa `expo-notifications`, para que el resto del código
 * dependa de esta interfaz y sea fácil de testear (basta mockear este archivo).
 *
 * Los identifiers son estables por slot, así que reprogramar es idempotente:
 * cancelar todo + reprogramar produce el mismo set de pendientes.
 */
export async function cancelAllScheduled(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleDaily(params: {
    identifier: string;
    hour: number;
    minute: number;
    content: Notifications.NotificationContentInput;
}): Promise<void> {
    await Notifications.scheduleNotificationAsync({
        identifier: params.identifier,
        content: params.content,
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: params.hour,
            minute: params.minute,
        },
    });
}

export { SchedulableTriggerInputTypes } from "expo-notifications";
