import { useCallback } from "react";

import clearScheduledNotifications from "../modules/notifications/scheduler/clearScheduledNotifications";
import rescheduleNotificationMoments from "../modules/notifications/scheduler/rescheduleNotificationMoments";
import { addCycle } from "../modules/storage/repositories/cycles.repository";
import { upsertDailyLog } from "../modules/storage/repositories/dailyLogs.repository";
import { deleteMoodCheckIn, upsertMoodCheckIn } from "../modules/storage/repositories/moodCheckIns.repository";
import { saveNotificationMoments } from "../modules/storage/repositories/notificationMoments.repository";
import { saveSettings } from "../modules/storage/repositories/settings.repository";
import resetAppData from "../modules/storage/services/resetAppData";
import syncObservedCyclesFromDailyLogs from "../modules/storage/services/syncObservedCycles";
import { NotificationMoment } from "../types/notifications.types";
import { DailyLog, MoodCheckIn } from "../types/records.types";
import { AppSettings } from "../types/settings.types";

interface UseAppPersistenceControllerParams {
    dismissExportSavedNotice: () => void;
    refreshData: () => Promise<void>;
    replaceNotificationMoments: (notificationMoments: NotificationMoment[]) => void;
    resetData: () => void;
    resetShellView: () => void;
}

interface UseAppPersistenceControllerResult {
    /** Finaliza onboarding persistiendo settings, ciclo inicial y momentos. */
    completeOnboarding: (settings: AppSettings, notificationMoments: NotificationMoment[]) => Promise<void>;
    /** Borra check-in existente y sincroniza snapshot raíz. */
    deleteCheckIn: (moodCheckIn?: MoodCheckIn | null) => Promise<void>;
    /** Limpia datos locales, notificaciones y estado visual del shell. */
    resetApplication: () => Promise<void>;
    /** Guarda check-in y/o daily log según payload recibido. */
    saveCheckIn: (moodCheckIn?: MoodCheckIn, dailyLog?: DailyLog) => Promise<void>;
    /** Persiste momentos de notificación y actualiza snapshot en memoria. */
    saveMoments: (next: NotificationMoment[]) => Promise<void>;
}

/** Encapsula acciones persistentes raíz: onboarding, check-ins, momentos y reset. */
export default function useAppPersistenceController({
    dismissExportSavedNotice,
    refreshData,
    replaceNotificationMoments,
    resetData,
    resetShellView,
}: UseAppPersistenceControllerParams): UseAppPersistenceControllerResult {
    const completeOnboarding = useCallback(
        async (settings: AppSettings, notificationMoments: NotificationMoment[]) => {
            await saveSettings(settings);
            await addCycle({
                startDate: settings.lastPeriodStart,
                endDate: null,
                predicted: false,
                createdAt: new Date().toISOString(),
            });
            const scheduled = await rescheduleNotificationMoments(notificationMoments);
            await saveNotificationMoments(scheduled);
            await refreshData();
        },
        [refreshData],
    );

    const saveMoments = useCallback(
        async (next: NotificationMoment[]) => {
            const scheduled = await rescheduleNotificationMoments(next);
            await saveNotificationMoments(scheduled);
            replaceNotificationMoments(scheduled);
        },
        [replaceNotificationMoments],
    );

    const saveCheckIn = useCallback(
        async (moodCheckIn?: MoodCheckIn, dailyLog?: DailyLog) => {
            if (moodCheckIn) {
                await upsertMoodCheckIn(moodCheckIn);
            }

            if (dailyLog) {
                await upsertDailyLog(dailyLog);
                await syncObservedCyclesFromDailyLogs();
            }

            await refreshData();
        },
        [refreshData],
    );

    const deleteCheckIn = useCallback(
        async (moodCheckIn?: MoodCheckIn | null) => {
            if (!moodCheckIn?.id) {
                return;
            }

            await deleteMoodCheckIn(moodCheckIn.id);
            await refreshData();
        },
        [refreshData],
    );

    const resetApplication = useCallback(async () => {
        await clearScheduledNotifications();
        await resetAppData();
        dismissExportSavedNotice();
        resetShellView();
        resetData();
    }, [dismissExportSavedNotice, resetData, resetShellView]);

    return {
        completeOnboarding,
        deleteCheckIn,
        resetApplication,
        saveCheckIn,
        saveMoments,
    };
}
