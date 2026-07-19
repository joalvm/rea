export const reminderIntervalHoursOptions = [3, 6, 12] as const;

export const defaultReminderSettings = {
    remindersEnabled: true,
    reminderIntervalHours: 6,
    reminderWindowStart: "09:00",
    reminderWindowEnd: "22:00",
    notifyDailyCheckin: true,
    discreetNotifications: true,
} as const;
