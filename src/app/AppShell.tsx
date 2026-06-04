import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";

import AppShellModals from "./components/AppShellModals";
import AppShellScene from "./components/AppShellScene";
import useAppBackupController from "./hooks/useAppBackupController";
import useAppBootstrapController from "./hooks/useAppBootstrapController";
import useAppPersistenceController from "./hooks/useAppPersistenceController";
import useAppQuickCheckInNotificationListener from "./hooks/useAppQuickCheckInNotificationListener";
import useAppShellState from "./hooks/useAppShellState";
import useDiaryStore from "../modules/state/useDiaryStore";
import { toIsoDate } from "../modules/cycle/utils/cycleDate.utils";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { colors } from "../theme";
import { BottomTabs } from "../ui/BottomTabs";
import styles from "./AppShell.styles";

/** Orquesta bootstrap, navegación local y modales raíz de aplicación. */
export default function AppShell() {
    const shellState = useAppShellState();
    const bootstrap = useAppBootstrapController();
    const { dailyRecords } = useDiaryStore();
    const todayIso = toIsoDate(new Date());
    const todayDailyLog = dailyRecords.find((entry) => entry.date === todayIso) ?? null;

    useAppQuickCheckInNotificationListener((momentType, source) =>
        shellState.openQuickCheckIn(momentType, source, todayDailyLog),
    );

    const backup = useAppBackupController({
        loading: bootstrap.loading,
        refreshData: bootstrap.refreshData,
        resetShellView: shellState.resetShellView,
    });
    const persistence = useAppPersistenceController({
        dismissExportSavedNotice: backup.dismissExportSavedNotice,
        notificationCadence: bootstrap.notificationCadence,
        refreshData: bootstrap.refreshData,
        replaceNotificationCadence: bootstrap.replaceNotificationCadence,
        resetData: bootstrap.resetData,
        resetShellView: shellState.resetShellView,
    });

    if (bootstrap.loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator color={colors.primaryDeep} size="large" />
                <StatusBar style="dark" />
            </View>
        );
    }

    if (!bootstrap.settings?.onboarded) {
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
                    activeTab={shellState.activeTab}
                    onCloseDay={shellState.closeDay}
                    onEditDailyLog={shellState.editDailyLog}
                    onEditQuickCheckIn={(entry, initialDailyLog) => {
                        const fallbackDailyLog =
                            dailyRecords.find((log) => log.date === toIsoDate(new Date(entry.datetime))) ?? null;
                        shellState.editQuickCheckIn(entry, initialDailyLog ?? fallbackDailyLog);
                    }}
                    onOpenDailyCheckIn={() => shellState.openDailyCheckIn(todayDailyLog)}
                    onOpenDay={shellState.openDay}
                    onOpenDiaryTab={shellState.openDiaryTab}
                    onOpenQuickCheckInNow={() => shellState.openQuickCheckIn("now", "manual", todayDailyLog)}
                    onOpenSettings={shellState.openSettings}
                    selectedDayIso={shellState.selectedDayIso}
                />
                <BottomTabs activeTab={shellState.activeTab} onTabChange={shellState.handleTabChange} />
            </View>
            <AppShellModals bootstrap={bootstrap} backup={backup} persistence={persistence} shellState={shellState} />
            <StatusBar style="dark" />
        </View>
    );
}
