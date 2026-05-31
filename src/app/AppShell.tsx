import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";

import AppShellScene from "./AppShellScene";
import { CheckInModal } from "../features/check-in/CheckInModal";
import { ScheduleModal } from "../features/settings/ScheduleModal";
import { SettingsModal } from "../features/settings/SettingsModal";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { colors } from "../theme";
import { BottomTabs } from "../ui/BottomTabs";
import styles from "./AppShell.styles";
import useAppShellController from "./useAppShellController";

/** Orquesta bootstrap, navegación local y modales raíz de aplicación. */
export default function AppShell() {
    const {
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
    } = useAppShellController();

    if (loading) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator color={colors.primaryDeep} size="large" />
                <StatusBar style="dark" />
            </View>
        );
    }

    if (!data.settings?.onboarded) {
        return (
            <>
                <OnboardingScreen
                    importingBackup={importingBackup}
                    onComplete={completeOnboarding}
                    onImportBackup={importBackup}
                />
                <StatusBar style="dark" />
            </>
        );
    }

    return (
        <View style={styles.app}>
            <View style={styles.scene}>
                <AppShellScene
                    activeTab={activeTab}
                    data={data}
                    onCloseDay={closeDay}
                    onEditDailyLog={editDailyLog}
                    onEditQuickCheckIn={editQuickCheckIn}
                    onOpenDailyCheckIn={openDailyCheckIn}
                    onOpenDay={openDay}
                    onOpenDiaryTab={openDiaryTab}
                    onOpenQuickCheckInNow={() => openQuickCheckIn("now")}
                    onOpenSettings={openSettings}
                    onOpenTab={handleTabChange}
                    selectedDayIso={selectedDayIso}
                    snapshot={snapshot}
                />
            </View>
            <BottomTabs activeTab={activeTab} onTabChange={handleTabChange} />
            <CheckInModal
                key={checkIn.sessionKey}
                initialCheckIn={checkIn.initialCheckIn}
                initialDailyLog={checkIn.initialDailyLog}
                mode={checkIn.mode}
                momentType={checkIn.momentType}
                onClose={closeCheckIn}
                onDelete={deleteCheckIn}
                onSave={saveCheckIn}
                question={checkIn.question}
                saveTarget={checkIn.saveTarget}
                visible={checkIn.visible}
            />
            <ScheduleModal moments={moments} onChange={saveMoments} onClose={closeSchedule} visible={scheduleVisible} />
            <SettingsModal
                exportSavedNotice={exportSavedNotice}
                exportingBackup={exportingBackup}
                importingBackup={importingBackup}
                moments={moments}
                onClose={closeSettings}
                onDismissExportSavedNotice={dismissExportSavedNotice}
                onExportBackup={exportBackup}
                onImportBackup={importBackup}
                onOpenSchedule={openScheduleFromSettings}
                onReset={resetApplication}
                onShareSavedBackup={shareSavedBackup}
                visible={settingsVisible}
            />
            <StatusBar style="dark" />
        </View>
    );
}
