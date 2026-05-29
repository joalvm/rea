import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";

import { CheckInModal } from "../features/check-in/CheckInModal";
import { ScheduleModal } from "../features/settings/ScheduleModal";
import { SettingsModal } from "../features/settings/SettingsModal";
import { CalendarScreen } from "../screens/calendar/CalendarScreen";
import { DayDetailScreen } from "../screens/day-detail/DayDetailScreen";
import { DiaryScreen } from "../screens/diary/DiaryScreen";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { PatternsScreen } from "../screens/patterns/PatternsScreen";
import { TodayScreen } from "../screens/today/TodayScreen";
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
        editDailyLog,
        editQuickCheckIn,
        handleTabChange,
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
                <OnboardingScreen onComplete={completeOnboarding} />
                <StatusBar style="dark" />
            </>
        );
    }

    return (
        <View style={styles.app}>
            <View style={styles.scene}>{renderTab()}</View>
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
                moments={moments}
                onClose={closeSettings}
                onOpenSchedule={openScheduleFromSettings}
                onReset={resetApplication}
                visible={settingsVisible}
            />
            <StatusBar style="dark" />
        </View>
    );

    function renderTab() {
        if (activeTab === "today" && selectedDayIso) {
            return (
                <DayDetailScreen
                    cycles={data.cycles}
                    dailyLogs={data.dailyLogs}
                    moodCheckIns={data.moodCheckIns}
                    onBack={closeDay}
                    onOpenDiary={openDiaryTab}
                    selectedIso={selectedDayIso}
                    settings={data.settings}
                />
            );
        }

        if (activeTab === "calendar") {
            return (
                <CalendarScreen
                    cycles={data.cycles}
                    dailyLogs={data.dailyLogs}
                    onOpenCheckIn={openDailyCheckIn}
                    settings={data.settings}
                    snapshot={snapshot}
                />
            );
        }

        if (activeTab === "diary") {
            return (
                <DiaryScreen
                    dailyLogs={data.dailyLogs}
                    moodCheckIns={data.moodCheckIns}
                    onEditCheckIn={editQuickCheckIn}
                    onEditDailyLog={editDailyLog}
                    onOpenCheckIn={openDailyCheckIn}
                    onOpenQuickCheckIn={() => openQuickCheckIn("now")}
                />
            );
        }

        if (activeTab === "patterns") {
            return (
                <PatternsScreen
                    cycles={data.cycles}
                    dailyLogs={data.dailyLogs}
                    moodCheckIns={data.moodCheckIns}
                    settings={data.settings}
                />
            );
        }

        return (
            <TodayScreen
                cycles={data.cycles}
                dailyLogs={data.dailyLogs}
                moodCheckIns={data.moodCheckIns}
                onOpenCheckIn={openDailyCheckIn}
                onOpenDay={openDay}
                onOpenQuickCheckIn={() => openQuickCheckIn("now")}
                onOpenCalendar={() => handleTabChange("calendar")}
                onOpenPatterns={() => handleTabChange("patterns")}
                onOpenSettings={openSettings}
                settings={data.settings}
                snapshot={snapshot}
            />
        );
    }
}
