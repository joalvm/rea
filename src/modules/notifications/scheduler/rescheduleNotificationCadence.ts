import { cancelAllScheduledNotificationsAsync } from "expo-notifications/build/cancelAllScheduledNotificationsAsync";
import {
    AndroidNotificationPriority,
    SchedulableTriggerInputTypes,
} from "expo-notifications/build/Notifications.types";
import { scheduleNotificationAsync } from "expo-notifications/build/scheduleNotificationAsync";

import { NotificationCadence } from "@/types/notifications.types";
import { translate } from "@/modules/localization/i18n";
import ensureNotificationPermission from "../permissions/ensureNotificationPermission";
import notificationBody from "../utils/notificationBody";

const LOOKAHEAD_DAYS = 7;

/** Reprograma próximos recordatorios según cadencia y ventana activa. */
export default async function rescheduleNotificationCadence(
    cadence: NotificationCadence,
): Promise<NotificationCadence> {
    await cancelAllScheduledNotificationsAsync();

    if (!cadence.enabled) {
        return cadence;
    }

    const allowed = await ensureNotificationPermission();
    if (!allowed) {
        return cadence;
    }

    const triggerDates = buildUpcomingTriggerDates(cadence, new Date());

    for (const triggerDate of triggerDates) {
        await scheduleNotificationAsync({
            content: {
                title: translate("notifications:title"),
                body: notificationBody(),
                data: { source: "cadence-reminder" },
                priority: AndroidNotificationPriority.LOW,
                sound: false,
            },
            trigger: {
                type: SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
            },
        });
    }

    return cadence;
}

function buildUpcomingTriggerDates(cadence: NotificationCadence, now: Date) {
    const slots = buildDailySlots(cadence);
    const triggerDates: Date[] = [];

    for (let offset = 0; offset < LOOKAHEAD_DAYS; offset += 1) {
        const dayBase = new Date(now);
        dayBase.setHours(0, 0, 0, 0);
        dayBase.setDate(dayBase.getDate() + offset);

        for (const slot of slots) {
            const triggerDate = new Date(dayBase);
            triggerDate.setHours(slot.hour, slot.minute, 0, 0);

            if (triggerDate <= now) {
                continue;
            }

            triggerDates.push(triggerDate);
        }
    }

    return triggerDates;
}

function buildDailySlots(cadence: NotificationCadence) {
    const startMinutes = parseTime(cadence.activeWindowStart);
    const endMinutes = Math.max(startMinutes, parseTime(cadence.activeWindowEnd));
    const intervalMinutes = Math.max(60, cadence.intervalHours * 60);
    const slots: { hour: number; minute: number }[] = [];

    for (
        let currentMinutes = startMinutes;
        currentMinutes <= endMinutes && slots.length < cadence.maxPromptsPerDay;
        currentMinutes += intervalMinutes
    ) {
        slots.push({ hour: Math.floor(currentMinutes / 60), minute: currentMinutes % 60 });
    }

    if (slots.length === 0) {
        slots.push({ hour: Math.floor(startMinutes / 60), minute: startMinutes % 60 });
    }

    return slots;
}

function parseTime(value: string) {
    const [hourRaw, minuteRaw] = value.split(":").map(Number);
    const safeHour = typeof hourRaw === "number" ? hourRaw : 9;
    const safeMinute = typeof minuteRaw === "number" ? minuteRaw : 0;
    const hour = Number.isFinite(safeHour) ? Math.min(23, Math.max(0, safeHour)) : 9;
    const minute = Number.isFinite(safeMinute) ? Math.min(59, Math.max(0, safeMinute)) : 0;
    return hour * 60 + minute;
}
