import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";

import AppShellScene from "./AppShellScene";
import useAppBackupController from "./useAppBackupController";
import useAppDataController from "./useAppDataController";
import useAppPersistenceController from "./useAppPersistenceController";
import useAppQuickCheckInNotificationListener from "./useAppQuickCheckInNotificationListener";
import useAppShellState from "./useAppShellState";
import { CheckInModal } from "../features/check-in/CheckInModal";
import { ScheduleModal } from "../features/settings/ScheduleModal";
import { SettingsModal } from "../features/settings/SettingsModal";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { colors } from "../theme";
import { BottomTabs } from "../ui/BottomTabs";
import styles from "./AppShell.styles";

/** Orquesta bootstrap, navegación local y modales raíz de aplicación. */
export default function AppShell() {
    const shellState = useAppShellState();
    const appData = useAppDataController();

    useAppQuickCheckInNotificationListener(shellState.openQuickCheckIn);

    const backup = useAppBackupController({
        loading: appData.loading,
        refreshData: appData.refreshData,
        resetShellView: shellState.resetShellView,
    });
    const persistence = useAppPersistenceController({
        dismissExportSavedNotice: backup.dismissExportSavedNotice,
        refreshData: appData.refreshData,
        replaceNotificationMoments: appData.replaceNotificationMoments,
        resetData: appData.resetData,
        resetShellView: shellState.resetShellView,
    });

    const closeSettings = () => {
        backup.dismissExportSavedNotice();
        shellState.closeSettings();
    };

    if (appData.loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator color={colors.primaryDeep} size="large" />
                <StatusBar style="dark" />
            </View>
        );
    }

    if (!appData.data.settings?.onboarded) {
        return (
            <>
                <OnboardingScreen
                    importingBackup={backup.importingBackup}
                    onComplete={persistence.completeOnboarding}
                    onImportBackup={backup.importBackup}
                />
                <StatusBar style="dark" />
            </>
        );
    }

    return (
        <View style={styles.app}>
            <View style={styles.scene}>
                <AppShellScene
                    data={appData.data}
                    activeTab={shellState.activeTab}
                    onCloseDay={shellState.closeDay}
                    onEditDailyLog={shellState.editDailyLog}
                    onEditQuickCheckIn={shellState.editQuickCheckIn}
                    onOpenDailyCheckIn={shellState.openDailyCheckIn}
                    onOpenDay={shellState.openDay}
                    onOpenDiaryTab={shellState.openDiaryTab}
                    onOpenQuickCheckInNow={() => shellState.openQuickCheckIn("now")}
                    onOpenSettings={shellState.openSettings}
                    onOpenTab={shellState.handleTabChange}
                    selectedDayIso={shellState.selectedDayIso}
                    snapshot={appData.snapshot}
                />
                <BottomTabs activeTab={shellState.activeTab} onTabChange={shellState.handleTabChange} />
            </View>
            <CheckInModal
                key={shellState.checkIn.sessionKey}
                initialCheckIn={shellState.checkIn.initialCheckIn}
                initialDailyLog={shellState.checkIn.initialDailyLog}
                mode={shellState.checkIn.mode}
                momentType={shellState.checkIn.momentType}
                onClose={shellState.closeCheckIn}
                onDelete={persistence.deleteCheckIn}
                onSave={persistence.saveCheckIn}
                question={shellState.checkIn.question}
                saveTarget={shellState.checkIn.saveTarget}
                visible={shellState.checkIn.visible}
            />
            <ScheduleModal
                moments={appData.moments}
                onChange={persistence.saveMoments}
                onClose={shellState.closeSchedule}
                visible={shellState.scheduleVisible}
            />
            <SettingsModal
                exportSavedNotice={backup.exportSavedNotice}
                exportingBackup={backup.exportingBackup}
                importingBackup={backup.importingBackup}
                moments={appData.moments}
                onClose={closeSettings}
                onDismissExportSavedNotice={backup.dismissExportSavedNotice}
                onExportBackup={backup.exportBackup}
                onImportBackup={backup.importBackup}
                onOpenSchedule={shellState.openScheduleFromSettings}
                onReset={persistence.resetApplication}
                onShareSavedBackup={backup.shareSavedBackup}
                visible={shellState.settingsVisible}
            />
            <StatusBar style="dark" />
        </View>
    );
}
