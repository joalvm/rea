import { useCallback } from "react";

import { CheckInSubmission } from "../../features/check-in/check-in.types";
import clearScheduledNotifications from "../../modules/notifications/scheduler/clearScheduledNotifications";
import rescheduleNotificationCadence from "../../modules/notifications/scheduler/rescheduleNotificationCadence";
import {
    completeUserProfile,
    saveReminderPreferences,
    saveUserSettings,
} from "../../modules/storage/services/profileState";
import resetAppData from "../../modules/storage/services/resetAppData";
import saveCheckInEntry, { deleteCheckIn as deleteCheckInEntry } from "../../modules/storage/services/saveCheckIn";
import seedDevelopmentLongTermUser from "../../modules/storage/services/seedDevelopmentLongTermUser";
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
    /** Finaliza onboarding persistiendo perfil, intencion, periodo inicial y recordatorios minimos. */
    completeOnboarding: (settings: AppSettings, notificationCadence: NotificationCadence) => Promise<void>;
    /** Borra check-in existente y recalcula modelos derivados. */
    deleteCheckIn: (moodCheckIn?: MoodCheckIn | null) => Promise<void>;
    /** Genera dataset fake largo para pruebas visuales en desarrollo. */
    seedDevelopmentUserData: () => Promise<void>;
    /** Limpia datos locales, notificaciones y estado visual del shell. */
    resetApplication: () => Promise<void>;
    /** Persiste ajustes base como nuevo contexto reproductivo activo. */
    saveAppSettings: (settings: AppSettings) => Promise<void>;
    /** Guarda check-in canonico y sus detalles observados. */
    saveCheckIn: (submission: CheckInSubmission) => Promise<void>;
    /** Persiste preferencias minimas de notificacion y actualiza snapshot en memoria. */
    saveNotificationCadence: (next: NotificationCadence) => Promise<void>;
}

/** Encapsula acciones persistentes raíz sin exponer repositorios a componentes. */
export default function useAppPersistenceController({
    dismissExportSavedNotice,
    notificationCadence,
    refreshData,
    replaceNotificationCadence,
    resetData,
    resetShellView,
}: UseAppPersistenceControllerParams): UseAppPersistenceControllerResult {
    const completeOnboarding = useCallback(
        async (settings: AppSettings, nextCadence: NotificationCadence) => {
            const scheduled = await rescheduleNotificationCadence(nextCadence);
            await completeUserProfile(settings, scheduled);
            await refreshData();
        },
        [refreshData],
    );

    const saveNotificationCadence = useCallback(
        async (next: NotificationCadence) => {
            const scheduled = await rescheduleNotificationCadence(next);
            await saveReminderPreferences(scheduled);
            replaceNotificationCadence(scheduled);
        },
        [replaceNotificationCadence],
    );

    const saveAppSettings = useCallback(
        async (settings: AppSettings) => {
            await saveUserSettings(settings);
            await refreshData();
        },
        [refreshData],
    );

    const saveCheckIn = useCallback(
        async (submission: CheckInSubmission) => {
            await saveCheckInEntry(submission);

            const scheduledCadence = await rescheduleNotificationCadence(notificationCadence);
            await saveReminderPreferences(scheduledCadence);
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

            await deleteCheckInEntry(moodCheckIn.id);
            await refreshData();
        },
        [refreshData],
    );

    const seedDevelopmentUserData = useCallback(async () => {
        const seeded = await seedDevelopmentLongTermUser({ notificationCadence });
        const scheduledCadence = await rescheduleNotificationCadence(seeded.notificationCadence);
        await saveReminderPreferences(scheduledCadence);
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
