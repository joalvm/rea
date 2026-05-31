import { addNotificationResponseReceivedListener } from "expo-notifications/build/NotificationsEmitter";
import { useCallback, useEffect, useMemo, useState } from "react";

import estimateCycle from "../modules/cycle/estimation/estimateCycle";
import createDefaultNotificationMoments from "../modules/notifications/defaults/createDefaultNotificationMoments";
import clearScheduledNotifications from "../modules/notifications/scheduler/clearScheduledNotifications";
import registerNotificationHandler from "../modules/notifications/scheduler/registerNotificationHandler";
import rescheduleNotificationMoments from "../modules/notifications/scheduler/rescheduleNotificationMoments";
import initializeDatabase from "../modules/storage/core/schema";
import { addCycle } from "../modules/storage/repositories/cycles.repository";
import { upsertDailyLog } from "../modules/storage/repositories/dailyLogs.repository";
import { deleteMoodCheckIn, upsertMoodCheckIn } from "../modules/storage/repositories/moodCheckIns.repository";
import { saveNotificationMoments } from "../modules/storage/repositories/notificationMoments.repository";
import { saveSettings } from "../modules/storage/repositories/settings.repository";
import loadAppData from "../modules/storage/services/loadAppData";
import resetAppData from "../modules/storage/services/resetAppData";
import syncObservedCyclesFromDailyLogs from "../modules/storage/services/syncObservedCycles";
import { AppData } from "../types/app.types";
import { NotificationMoment } from "../types/notifications.types";
import { DailyLog, MomentType, MoodCheckIn } from "../types/records.types";
import { AppSettings } from "../types/settings.types";
import { initialData } from "./app-shell.types";
import useAppBackupController from "./useAppBackupController";
import useAppShellState from "./useAppShellState";

registerNotificationHandler();

/** Encapsula bootstrap, listeners y acciones raíz usadas por AppShell. */
export default function useAppShellController() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AppData>(initialData);
    const {
        activeTab,
        checkIn,
        closeCheckIn,
        closeDay,
        closeSchedule,
        closeSettings: closeShellSettings,
        editDailyLog,
        editQuickCheckIn,
        handleTabChange,
        openDailyCheckIn,
        openDay,
        openDiaryTab,
        openQuickCheckIn,
        openScheduleFromSettings,
        openSettings,
        resetShellView,
        scheduleVisible,
        selectedDayIso,
        settingsVisible,
    } = useAppShellState();

    const snapshot = useMemo(
        () => estimateCycle(data.settings, data.cycles, data.dailyLogs),
        [data.cycles, data.dailyLogs, data.settings],
    );
    const moments = data.notificationMoments.length > 0 ? data.notificationMoments : createDefaultNotificationMoments();

    const boot = useCallback(async () => {
        await initializeDatabase();
        const loaded = await loadAppData();
        setData(normalizeAppData(loaded));
        setLoading(false);
    }, []);

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            void boot();
        });

        return () => cancelAnimationFrame(frame);
    }, [boot]);

    useEffect(() => {
        const subscription = addNotificationResponseReceivedListener((response) => {
            const type = response.notification.request.content.data?.momentType;
            openQuickCheckIn(typeof type === "string" ? (type as MomentType) : "now");
        });

        return () => subscription.remove();
    }, [openQuickCheckIn]);

    const refreshData = useCallback(async () => {
        const loaded = await loadAppData();
        setData(normalizeAppData(loaded));
    }, []);

    const {
        dismissExportSavedNotice,
        exportBackup,
        exportSavedNotice,
        exportingBackup,
        importBackup,
        importingBackup,
        shareSavedBackup,
    } = useAppBackupController({
        loading,
        refreshData,
        resetShellView,
    });

    const closeSettings = () => {
        dismissExportSavedNotice();
        closeShellSettings();
    };

    const completeOnboarding = async (settings: AppSettings, notificationMoments: NotificationMoment[]) => {
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
    };

    const saveMoments = async (next: NotificationMoment[]) => {
        const scheduled = await rescheduleNotificationMoments(next);
        await saveNotificationMoments(scheduled);
        setData((current) => ({ ...current, notificationMoments: scheduled }));
    };

    const saveCheckIn = async (moodCheckIn?: MoodCheckIn, dailyLog?: DailyLog) => {
        if (moodCheckIn) {
            await upsertMoodCheckIn(moodCheckIn);
        }

        if (dailyLog) {
            await upsertDailyLog(dailyLog);
            await syncObservedCyclesFromDailyLogs();
        }

        await refreshData();
    };

    const deleteCheckIn = async (moodCheckIn?: MoodCheckIn | null) => {
        if (!moodCheckIn?.id) {
            return;
        }

        await deleteMoodCheckIn(moodCheckIn.id);
        await refreshData();
    };

    const resetApplication = async () => {
        await clearScheduledNotifications();
        await resetAppData();
        dismissExportSavedNotice();
        resetShellView();
        setData(initialData);
    };

    return {
        activeTab,
        checkIn,
        closeCheckIn,
        closeDay,
        closeSchedule,
        closeSettings,
        completeOnboarding,
        data,
        deleteCheckIn,
        dismissExportSavedNotice,
        editDailyLog,
        editQuickCheckIn,
        exportBackup,
        exportSavedNotice,
        exportingBackup,
        handleTabChange,
        importBackup,
        importingBackup,
        loading,
        moments,
        openDailyCheckIn,
        openDay,
        openDiaryTab,
        openQuickCheckIn,
        openScheduleFromSettings,
        openSettings,
        resetApplication,
        saveCheckIn,
        saveMoments,
        scheduleVisible,
        selectedDayIso,
        shareSavedBackup,
        settingsVisible,
        snapshot,
    };
}

/** Rehidrata defaults locales para que el shell siempre tenga momentos utilizables. */
function normalizeAppData(loaded: AppData): AppData {
    return {
        ...loaded,
        notificationMoments:
            loaded.notificationMoments.length > 0 ? loaded.notificationMoments : createDefaultNotificationMoments(),
    };
}
