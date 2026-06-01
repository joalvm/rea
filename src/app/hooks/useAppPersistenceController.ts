import { useCallback } from "react";

import clearScheduledNotifications from "../../modules/notifications/scheduler/clearScheduledNotifications";
import rescheduleNotificationCadence from "../../modules/notifications/scheduler/rescheduleNotificationCadence";
import { addCycle } from "../../modules/storage/repositories/cycles.repository";
import { upsertDailyLog } from "../../modules/storage/repositories/dailyLogs.repository";
import { deleteMoodCheckIn, upsertMoodCheckIn } from "../../modules/storage/repositories/moodCheckIns.repository";
import { saveNotificationCadence as persistNotificationCadence } from "../../modules/storage/repositories/notificationMoments.repository";
import { saveSettings } from "../../modules/storage/repositories/settings.repository";
import resetAppData from "../../modules/storage/services/resetAppData";
import seedDevelopmentLongTermUser from "../../modules/storage/services/seedDevelopmentLongTermUser";
import syncObservedCyclesFromDailyLogs from "../../modules/storage/services/syncObservedCycles";
import { CheckInSubmission } from "../../features/check-in/check-in.types";
import { NotificationCadence } from "../../types/notifications.types";
import { MoodCheckIn } from "../../types/records.types";
import { AppSettings } from "../../types/settings.types";

interface UseAppPersistenceControllerParams {
    dismissExportSavedNotice: () => void;
    notificationCadence: NotificationCadence;
    refreshData: () => Promise<void>;
    replaceNotificationCadence: (notificationCadence: NotificationCadence) => void;
    resetData: () => void;
    resetShellView: () => void;
}

/** Contrato de salida de useAppPersistenceController para acciones persistentes del shell. */
export interface UseAppPersistenceControllerResult {
    /** Finaliza onboarding persistiendo settings, ciclo inicial y momentos. */
    completeOnboarding: (settings: AppSettings, notificationCadence: NotificationCadence) => Promise<void>;
    /** Borra check-in existente y sincroniza snapshot raíz. */
    deleteCheckIn: (moodCheckIn?: MoodCheckIn | null) => Promise<void>;
    /** Genera dataset fake largo para pruebas visuales en desarrollo. */
    seedDevelopmentUserData: () => Promise<void>;
    /** Limpia datos locales, notificaciones y estado visual del shell. */
    resetApplication: () => Promise<void>;
    /** Persiste ajustes base y refresca snapshot raíz. */
    saveAppSettings: (settings: AppSettings) => Promise<void>;
    /** Guarda check-in y/o daily log según payload recibido. */
    saveCheckIn: (submission: CheckInSubmission) => Promise<void>;
    /** Persiste cadencia de notificación y actualiza snapshot en memoria. */
    saveNotificationCadence: (next: NotificationCadence) => Promise<void>;
}

/** Encapsula acciones persistentes raíz: onboarding, check-ins, momentos y reset. */
export default function useAppPersistenceController({
    dismissExportSavedNotice,
    notificationCadence,
    refreshData,
    replaceNotificationCadence,
    resetData,
    resetShellView,
}: UseAppPersistenceControllerParams): UseAppPersistenceControllerResult {
    const completeOnboarding = useCallback(
        async (settings: AppSettings, notificationCadence: NotificationCadence) => {
            await saveSettings(settings);
            await addCycle({
                startDate: settings.lastPeriodStart,
                endDate: null,
                predicted: false,
                createdAt: new Date().toISOString(),
            });
            const scheduled = await rescheduleNotificationCadence(notificationCadence);
            await persistNotificationCadence(scheduled);
            await refreshData();
        },
        [refreshData],
    );

    const saveNotificationCadence = useCallback(
        async (next: NotificationCadence) => {
            const scheduled = await rescheduleNotificationCadence(next);
            await persistNotificationCadence(scheduled);
            replaceNotificationCadence(scheduled);
        },
        [replaceNotificationCadence],
    );

    const saveAppSettings = useCallback(
        async (settings: AppSettings) => {
            await saveSettings(settings);
            await refreshData();
        },
        [refreshData],
    );

    const saveCheckIn = useCallback(
        async ({ moodCheckIn, dailyLog }: CheckInSubmission) => {
            if (moodCheckIn) {
                await upsertMoodCheckIn(moodCheckIn);
            }

            if (dailyLog) {
                await upsertDailyLog(dailyLog);
                await syncObservedCyclesFromDailyLogs();
            }

            const nextCadence = {
                ...notificationCadence,
                lastCompletedCheckInAt: new Date().toISOString(),
            };
            const scheduledCadence = await rescheduleNotificationCadence(nextCadence);
            await persistNotificationCadence(scheduledCadence);
            replaceNotificationCadence(scheduledCadence);

            await refreshData();
        },
        [notificationCadence, refreshData, replaceNotificationCadence],
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

    const seedDevelopmentUserData = useCallback(async () => {
        const seeded = await seedDevelopmentLongTermUser({ notificationCadence });
        const scheduledCadence = await rescheduleNotificationCadence(seeded.notificationCadence);
        await persistNotificationCadence(scheduledCadence);
        replaceNotificationCadence(scheduledCadence);
        await refreshData();
    }, [notificationCadence, refreshData, replaceNotificationCadence]);

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
        saveAppSettings,
        saveCheckIn,
        saveNotificationCadence,
        seedDevelopmentUserData,
    };
}
