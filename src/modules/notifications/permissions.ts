import { loadNotificationsModule } from "./expoNotificationsAdapter";

/**
 * Pide permiso de notificaciones locales. Envoltorio fino sobre
 * `requestPermissionsAsync` para que el resto del código no tenga que importar
 * `expo-notifications` (regla de dueño único: solo este módulo lo importa).
 *
 * En iOS muestra el diálogo del sistema la primera vez; llamadas posteriores
 * leen el estado sin pedir de nuevo. En Android ≥ 13 también muestra diálogo;
 * versiones menores conceden por defecto.
 */
export async function requestNotificationPermission(): Promise<boolean> {
    const notifications = await loadNotificationsModule();
    if (!notifications) return false;

    const result = await notifications.requestPermissionsAsync();
    // `granted` ya agrega el caso iOS PROVISIONAL y AUTHORIZED en el binding;
    // el estado detallado (status) queda para diagnósticos, no para decidir.
    return Boolean(result.granted);
}

/**
 * Estado actual del permiso, sin pedir. Útil para mostrar un banner de
 * "permiso denegado, toca para volver a pedirlo" sin disparar el diálogo.
 */
export async function getNotificationPermission(): Promise<boolean> {
    const notifications = await loadNotificationsModule();
    if (!notifications) return false;

    const result = await notifications.getPermissionsAsync();
    return Boolean(result.granted);
}
