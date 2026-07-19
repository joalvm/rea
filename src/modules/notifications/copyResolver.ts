import i18n from "@/modules/i18n/i18n";

import type { NotificationCopy, NotificationType } from "./types";

/**
 * Resuelve el copy de cada tipo de notificación desde el namespace
 * `notifications` de i18n. Devuelve un callback listo para pasárselo a
 * `reprogramAll({ resolveCopy })`.
 *
 * El copy se lee en el momento de programar (no en el de disparar), así que
 * respeta el idioma activo al reprogramar. Si la usuaria cambia de idioma, la
 * próxima apertura de la app reprograma y refresca los textos.
 */
export function notificationCopyResolver(): (type: NotificationType) => NotificationCopy {
    return (type) => {
        switch (type) {
            case "daily_checkin":
                return {
                    title: i18n.t("notifications:dailyCheckin.title", { defaultValue: "Rea" }),
                    body: i18n.t("notifications:dailyCheckin.body", { defaultValue: "Tienes un recordatorio" }),
                };
        }
    };
}
