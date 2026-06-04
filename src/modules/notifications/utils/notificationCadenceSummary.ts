import { translate } from "@/modules/localization/i18n";
import { NotificationCadence } from "@/types/notifications.types";

/** Resume cadencia en una frase corta y legible para UI. */
export default function notificationCadenceSummary(cadence: NotificationCadence) {
    if (!cadence.enabled) {
        return translate("notifications:cadence.paused");
    }

    return translate("notifications:cadence.summary", {
        end: cadence.activeWindowEnd,
        intervalHours: cadence.intervalHours,
        start: cadence.activeWindowStart,
    });
}
