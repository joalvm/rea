import { NotificationCadence } from "@/types/notifications.types";

/** Resume cadencia en una frase corta y legible para UI. */
export default function notificationCadenceSummary(cadence: NotificationCadence) {
    if (!cadence.enabled) {
        return "Pausados";
    }

    return `Cada ${cadence.intervalHours} h entre ${cadence.activeWindowStart} y ${cadence.activeWindowEnd}`;
}
