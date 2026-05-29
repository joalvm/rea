import { getPermissionsAsync, requestPermissionsAsync } from "expo-notifications/build/NotificationPermissions";

/** Garantiza permisos antes de programar recordatorios locales. */
export default async function ensureNotificationPermission(): Promise<boolean> {
    const current = await getPermissionsAsync();
    if (current.granted) {
        return true;
    }

    const requested = await requestPermissionsAsync();
    return requested.granted;
}
