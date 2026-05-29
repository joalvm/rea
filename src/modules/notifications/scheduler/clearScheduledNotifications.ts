import { cancelAllScheduledNotificationsAsync } from "expo-notifications/build/cancelAllScheduledNotificationsAsync";

/** Limpia todos los recordatorios locales programados por app. */
export default async function clearScheduledNotifications() {
    await cancelAllScheduledNotificationsAsync();
}
