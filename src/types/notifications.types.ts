/** Configura cadencia base de recordatorios contextuales. */
export interface NotificationCadence {
    enabled: boolean;
    intervalHours: number;
    activeWindowStart: string;
    activeWindowEnd: string;
    maxPromptsPerDay: number;
    snoozeOptions: number[];
    lastPromptAt?: string | null;
    lastCompletedCheckInAt?: string | null;
    notificationIds?: string[];
}
