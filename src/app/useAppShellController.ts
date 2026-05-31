import useAppBackupController from "./useAppBackupController";
import useAppDataController from "./useAppDataController";
import useAppPersistenceController from "./useAppPersistenceController";
import useAppQuickCheckInNotificationListener from "./useAppQuickCheckInNotificationListener";
import useAppShellState from "./useAppShellState";

/** Encapsula bootstrap, listeners y acciones raíz usadas por AppShell. */
export default function useAppShellController() {
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
    const { data, loading, moments, refreshData, replaceNotificationMoments, resetData, snapshot } =
        useAppDataController();

    useAppQuickCheckInNotificationListener(openQuickCheckIn);

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
    const { completeOnboarding, deleteCheckIn, resetApplication, saveCheckIn, saveMoments } =
        useAppPersistenceController({
            dismissExportSavedNotice,
            refreshData,
            replaceNotificationMoments,
            resetData,
            resetShellView,
        });

    const closeSettings = () => {
        dismissExportSavedNotice();
        closeShellSettings();
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
