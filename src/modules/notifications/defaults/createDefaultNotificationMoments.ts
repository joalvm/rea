import { NotificationMoment } from "../../../types/notifications.types";

/** Crea horarios base cuando usuaria aun no configuró recordatorios. */
export default function createDefaultNotificationMoments(): NotificationMoment[] {
    return [
        {
            id: "morning",
            label: "Mañana",
            time: "08:30",
            enabled: true,
            days: [1, 2, 3, 4, 5, 6, 0],
            type: "morning",
            question: "¿Cómo despertaste?",
            notificationIds: [],
        },
        {
            id: "night",
            label: "Noche",
            time: "21:30",
            enabled: true,
            days: [1, 2, 3, 4, 5, 6, 0],
            type: "night",
            question: "¿Cómo estuvo tu día?",
            notificationIds: [],
        },
    ];
}
