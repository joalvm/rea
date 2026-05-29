import { NotificationMoment } from "@/types/notifications.types";

/** Devuelve copy breve según momento configurado para recordatorio. */
export default function notificationBody(moment: NotificationMoment): string {
    if (moment.type === "morning") {
        return "¿Cómo despertaste?";
    }

    if (moment.type === "night") {
        return "¿Cómo estuvo tu día?";
    }

    return "¿Cómo te sientes ahora?";
}
