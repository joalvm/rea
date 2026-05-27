import { cancelAllScheduledNotificationsAsync } from "expo-notifications/build/cancelAllScheduledNotificationsAsync";
import { getPermissionsAsync, requestPermissionsAsync } from "expo-notifications/build/NotificationPermissions";
import { setNotificationHandler } from "expo-notifications/build/NotificationsHandler";
import { AndroidNotificationPriority, SchedulableTriggerInputTypes } from "expo-notifications/build/Notifications.types";
import { scheduleNotificationAsync } from "expo-notifications/build/scheduleNotificationAsync";

import { NotificationMoment } from "./types";

setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export function createDefaultNotificationMoments(): NotificationMoment[] {
  return [
    {
      id: "morning",
      label: "Mañana",
      time: "08:30",
      enabled: true,
      days: [1, 2, 3, 4, 5, 6, 0],
      type: "morning",
      question: "¿Cómo despertaste?",
      notificationIds: []
    },
    {
      id: "night",
      label: "Noche",
      time: "21:30",
      enabled: true,
      days: [1, 2, 3, 4, 5, 6, 0],
      type: "night",
      question: "¿Cómo estuvo tu día?",
      notificationIds: []
    }
  ];
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await getPermissionsAsync();
  if (current.granted) return true;
  const requested = await requestPermissionsAsync();
  return requested.granted;
}

export async function rescheduleNotificationMoments(moments: NotificationMoment[]): Promise<NotificationMoment[]> {
  await cancelAllScheduledNotificationsAsync();
  const allowed = await ensureNotificationPermission();
  if (!allowed) return moments.map((moment) => ({ ...moment, notificationIds: [] }));

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
          title: "Mensu",
          body: notificationBody(moment),
          data: { momentId: moment.id, momentType: moment.type },
          priority: AndroidNotificationPriority.LOW,
          sound: false
        },
        trigger: {
          type: SchedulableTriggerInputTypes.WEEKLY,
          weekday: day === 0 ? 1 : day + 1,
          hour,
          minute
        }
      });
      ids.push(id);
    }

    scheduled.push({ ...moment, notificationIds: ids });
  }

  return scheduled;
}

function notificationBody(moment: NotificationMoment): string {
  if (moment.type === "morning") return "Un registro corto para empezar el día.";
  if (moment.type === "night") return "Un cierre breve para guardar cómo te fue.";
  return "Tienes un check-in corto disponible.";
}
