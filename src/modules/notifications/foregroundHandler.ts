import * as Notifications from "expo-notifications";

/**
 * Registra cómo presentar las notificaciones que llegan en primer plano (la app
 * abierta). Discreto por defecto: alerta visible pero sin sonido ni badge.
 *
 * Devuelve una función para desmontar (aunque en la práctica el handler vive
 * toda la sesión). Lo separamos en archivo propio para aislar el import de
 * `expo-notifications` y facilitar su testeo.
 */
export function setForegroundHandler(): () => void {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
            priority: Notifications.AndroidNotificationPriority.HIGH,
        }),
    });

    return () => {
        // `expo-notifications` no expone un `unsetNotificationHandler` público;
        // el handler se reemplaza al volver a registrar. El teardown queda como
        // noop para mantener el contrato de "devuelve cleanup".
    };
}
