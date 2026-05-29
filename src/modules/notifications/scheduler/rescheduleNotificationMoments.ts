import { cancelAllScheduledNotificationsAsync } from "expo-notifications/build/cancelAllScheduledNotificationsAsync";
import {
    AndroidNotificationPriority,
    SchedulableTriggerInputTypes,
} from "expo-notifications/build/Notifications.types";
import { scheduleNotificationAsync } from "expo-notifications/build/scheduleNotificationAsync";

import { NotificationMoment } from "../../../types/notifications.types";
import ensureNotificationPermission from "../permissions/ensureNotificationPermission";
import notificationBody from "../utils/notificationBody";

/** Reprograma recordatorios persistiendo ids concretos creados por sistema. */
export default async function rescheduleNotificationMoments(
    moments: NotificationMoment[],
): Promise<NotificationMoment[]> {
    await cancelAllScheduledNotificationsAsync();

    const allowed = await ensureNotificationPermission();
    if (!allowed) {
        return moments.map((moment) => ({ ...moment, notificationIds: [] }));
    }

    const scheduled: NotificationMoment[] = [];
    for (const moment of moments) {
        if (!moment.enabled) {
            scheduled.push({ ...moment, notificationIds: [] });
            continue;
        }

        const [hourRaw, minuteRaw] = moment.time.split(":").map(Number);
        const hour = hourRaw ?? 8;
        const minute = minuteRaw ?? 0;
        const ids: string[] = [];
        const days = moment.days.length > 0 ? moment.days : [1, 2, 3, 4, 5, 6, 0];

        for (const day of days) {
            const id = await scheduleNotificationAsync({
                content: {
                    title: "Un momento para ti",
                    body: notificationBody(moment),
                    data: { momentId: moment.id, momentType: moment.type },
                    priority: AndroidNotificationPriority.LOW,
                    sound: false,
                },
                trigger: {
                    type: SchedulableTriggerInputTypes.WEEKLY,
                    weekday: day === 0 ? 1 : day + 1,
                    hour,
                    minute,
                },
            });

            ids.push(id);
        }

        scheduled.push({ ...moment, notificationIds: ids });
    }

    return scheduled;
}
