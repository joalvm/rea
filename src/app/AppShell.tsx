import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";

import AppShellModals from "./components/AppShellModals";
import AppShellScene from "./components/AppShellScene";
import useAppBackupController from "./hooks/useAppBackupController";
import useAppDataController from "./hooks/useAppDataController";
import useAppPersistenceController from "./hooks/useAppPersistenceController";
import useAppQuickCheckInNotificationListener from "./hooks/useAppQuickCheckInNotificationListener";
import useAppShellState from "./hooks/useAppShellState";
import { toIsoDate } from "../modules/cycle/utils/cycleDate.utils";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { colors } from "../theme";
import { BottomTabs } from "../ui/BottomTabs";
import styles from "./AppShell.styles";

/** Orquesta bootstrap, navegación local y modales raíz de aplicación. */
export default function AppShell() {
    const shellState = useAppShellState();
    const appData = useAppDataController();
    const todayIso = toIsoDate(new Date());
    const todayDailyLog = appData.data.dailyLogs.find((entry) => entry.date === todayIso) ?? null;

    useAppQuickCheckInNotificationListener((momentType, source) =>
        shellState.openQuickCheckIn(momentType, source, todayDailyLog),
    );

    const backup = useAppBackupController({
        loading: appData.loading,
        refreshData: appData.refreshData,
        resetShellView: shellState.resetShellView,
    });
    const persistence = useAppPersistenceController({
        dismissExportSavedNotice: backup.dismissExportSavedNotice,
        notificationCadence: appData.notificationCadence,
        refreshData: appData.refreshData,
        replaceNotificationCadence: appData.replaceNotificationCadence,
        resetData: appData.resetData,
        resetShellView: shellState.resetShellView,
    });

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
                    onEditQuickCheckIn={(entry, initialDailyLog) => {
                        const fallbackDailyLog =
                            appData.data.dailyLogs.find((log) => log.date === toIsoDate(new Date(entry.datetime))) ??
                            null;
                        shellState.editQuickCheckIn(entry, initialDailyLog ?? fallbackDailyLog);
                    }}
                    onOpenDailyCheckIn={() => shellState.openDailyCheckIn(todayDailyLog)}
                    onOpenDay={shellState.openDay}
                    onOpenDiaryTab={shellState.openDiaryTab}
                    onOpenQuickCheckInNow={() => shellState.openQuickCheckIn("now", "manual", todayDailyLog)}
                    onOpenSettings={shellState.openSettings}
                    selectedDayIso={shellState.selectedDayIso}
                    snapshot={appData.snapshot}
                />
                <BottomTabs activeTab={shellState.activeTab} onTabChange={shellState.handleTabChange} />
            </View>
            <AppShellModals appData={appData} backup={backup} persistence={persistence} shellState={shellState} />
            <StatusBar style="dark" />
        </View>
    );
}
