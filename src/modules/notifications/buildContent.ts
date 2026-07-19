import type { NotificationContentInput } from "expo-notifications";

import type { NotificationCopy, NotificationDeepLink, NotificationType } from "./types";

/**
 * Construye el `content` de una notificación local.
 *
 ** Discreto (`discreetNotifications = true`): el lockscreen dice "Rea · tienes
 *   un recordatorio", sin revelar contenido íntimo. El cuerpo real viaja en
 *   `data` (no lo muestra el SO) para que la app lo lea al abrirla.
 *
 * Explícito (opt-in): título y cuerpo con copy del tipo, para quien prefiera
 *   saber de un vistazo qué le recuerda la app.
 *
 * Puro: no toca i18n ni la base de datos. El caller pasa los strings ya
 * resueltos según el idioma activo.
 */
export function buildContent(params: {
    type: NotificationType;
    discreet: boolean;
    copy: NotificationCopy;
    deepLink: NotificationDeepLink;
}): NotificationContentInput {
    const { discreet, copy, deepLink, type } = params;

    const data = {
        url: `rea://${deepLink.replace(/^\//, "")}`,
        type,
    };

    if (discreet) {
        return {
            title: "Rea",
            body: copy.body,
            sound: false,
            interruptionLevel: "passive",
            data,
        };
    }

    return {
        title: copy.title,
        body: copy.body,
        sound: "default",
        data,
    };
}
