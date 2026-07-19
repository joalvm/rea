import * as Notifications from "expo-notifications";

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
    const result = await Notifications.requestPermissionsAsync();
    // `granted` ya agrega el caso iOS PROVISIONAL y AUTHORIZED en el binding;
    // el estado detallado (status) queda para diagnósticos, no para decidir.
    return Boolean(result.granted);
}

/**
 * Estado actual del permiso, sin pedir. Útil para mostrar un banner de
 * "permiso denegado, toca para volver a pedirlo" sin disparar el diálogo.
 */
export async function getNotificationPermission(): Promise<boolean> {
    const result = await Notifications.getPermissionsAsync();
    return Boolean(result.granted);
}
