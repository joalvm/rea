import { create } from "zustand";

import createDefaultNotificationCadence from "@/modules/notifications/defaults/createDefaultNotificationCadence";
import clearScheduledNotifications from "@/modules/notifications/scheduler/clearScheduledNotifications";
import rescheduleNotificationCadence from "@/modules/notifications/scheduler/rescheduleNotificationCadence";
import loadAppStoreData from "@/modules/storage/services/loadAppStoreData";
import {
    completeUserProfile,
    saveReminderPreferences,
    saveUserSettings,
} from "@/modules/storage/services/profileState";
import resetAppData from "@/modules/storage/services/resetAppData";
import saveCheckInEntry, {
    deleteCheckIn as deleteCheckInEntry,
    type SaveCheckInInput,
} from "@/modules/storage/services/saveCheckIn";
import seedDevelopmentLongTermUser from "@/modules/storage/services/seedDevelopmentLongTermUser";
import { AppStoreData, initialAppStoreData } from "@/types/app.types";
import { NotificationCadence } from "@/types/notifications.types";
import { MoodCheckIn } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";

import useContentStore from "./useContentStore";

interface AppStoreState {
    data: AppStoreData;
    loading: boolean;
    bootstrap: () => Promise<void>;
    completeOnboarding: (settings: AppSettings, notificationCadence: NotificationCadence) => Promise<void>;
    deleteCheckIn: (moodCheckIn?: MoodCheckIn | null) => Promise<void>;
    refreshData: () => Promise<void>;
    resetApplication: () => Promise<void>;
    saveAppSettings: (settings: AppSettings) => Promise<void>;
    saveCheckIn: (submission: SaveCheckInInput) => Promise<void>;
    saveNotificationCadence: (notificationCadence: NotificationCadence) => Promise<void>;
    seedDevelopmentUserData: () => Promise<void>;
}

/** Store raiz para acciones locales y snapshot de Rea; SQLite sigue siendo fuente de verdad. */
const useAppStore = create<AppStoreState>((set, get) => {
    const replaceNotificationCadence = (notificationCadence: NotificationCadence) => {
        set((current) => ({
            data: {
                ...current.data,
                notificationCadence,
            },
        }));
    };

    return {
        data: initialAppStoreData,
        loading: true,
        bootstrap: async () => {
            set({ loading: true });
            const data = await loadAppStoreData();
            set({ data, loading: false });
        },
        completeOnboarding: async (settings, notificationCadence) => {
            const scheduledCadence = await rescheduleNotificationCadence(notificationCadence);
            await completeUserProfile(settings, scheduledCadence);
            await get().refreshData();
        },
        deleteCheckIn: async (moodCheckIn) => {
            if (!moodCheckIn?.id) {
                return;
            }

            await deleteCheckInEntry(moodCheckIn.id);
            await get().refreshData();
        },
        refreshData: async () => {
            const data = await loadAppStoreData();
            set({ data, loading: false });
        },
        resetApplication: async () => {
            await clearScheduledNotifications();
            await resetAppData();
            useContentStore.getState().resetContent();
            set({ data: initialAppStoreData, loading: false });
        },
        saveAppSettings: async (settings) => {
            await saveUserSettings(settings);
            await get().refreshData();
        },
        saveCheckIn: async (submission) => {
            await saveCheckInEntry(submission);

            const currentCadence = get().data.notificationCadence ?? createDefaultNotificationCadence();
            const scheduledCadence = await rescheduleNotificationCadence(currentCadence);
            await saveReminderPreferences(scheduledCadence);
            replaceNotificationCadence(scheduledCadence);

            await get().refreshData();
        },
        saveNotificationCadence: async (notificationCadence) => {
            const scheduledCadence = await rescheduleNotificationCadence(notificationCadence);
            await saveReminderPreferences(scheduledCadence);
            replaceNotificationCadence(scheduledCadence);
        },
        seedDevelopmentUserData: async () => {
            const currentCadence = get().data.notificationCadence ?? createDefaultNotificationCadence();
            const seeded = await seedDevelopmentLongTermUser({ notificationCadence: currentCadence });
            const scheduledCadence = await rescheduleNotificationCadence(seeded.notificationCadence);
            await saveReminderPreferences(scheduledCadence);
            replaceNotificationCadence(scheduledCadence);
            await get().refreshData();
        },
    };
});

export default useAppStore;
