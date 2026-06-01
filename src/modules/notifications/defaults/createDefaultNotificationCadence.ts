import { NotificationCadence } from "@/types/notifications.types";

/** Crea cadencia base cuando usuaria aún no configuró recordatorios. */
export default function createDefaultNotificationCadence(): NotificationCadence {
    return {
        enabled: true,
        intervalHours: 6,
        activeWindowStart: "09:00",
        activeWindowEnd: "21:00",
        maxPromptsPerDay: 3,
        snoozeOptions: [1, 3, 24],
        lastPromptAt: null,
        lastCompletedCheckInAt: null,
        notificationIds: [],
    };
}
