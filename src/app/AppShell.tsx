import { addNotificationResponseReceivedListener } from "expo-notifications/build/NotificationsEmitter";
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";

import { CheckInModal } from "../features/check-in/CheckInModal";
import { ScheduleModal } from "../features/settings/ScheduleModal";
import { SettingsModal } from "../features/settings/SettingsModal";
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
import { CalendarScreen } from "../screens/calendar/CalendarScreen";
import { DayDetailScreen } from "../screens/day-detail/DayDetailScreen";
import { DiaryScreen } from "../screens/diary/DiaryScreen";
import { OnboardingScreen } from "../screens/onboarding/OnboardingScreen";
import { PatternsScreen } from "../screens/patterns/PatternsScreen";
import { TodayScreen } from "../screens/today/TodayScreen";
import { colors } from "../theme";
import { BottomTabs } from "../ui/BottomTabs";
import { AppData, TabKey } from "../types/app.types";
import { NotificationMoment } from "../types/notifications.types";
import { DailyLog, MomentType, MoodCheckIn } from "../types/records.types";
import { AppSettings } from "../types/settings.types";
import { CheckInState, initialData } from "./app-shell.types";

registerNotificationHandler();

/** Orquesta bootstrap, navegación local y modales raíz de aplicación. */
export default function AppShell() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AppData>(initialData);
    const [activeTab, setActiveTab] = useState<TabKey>("today");
    const [selectedDayIso, setSelectedDayIso] = useState<string | null>(null);
    const [scheduleVisible, setScheduleVisible] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [checkIn, setCheckIn] = useState<CheckInState>({
        visible: false,
        sessionKey: 0,
        mode: "daily",
        momentType: "now",
        question: "¿Cómo te sientes hoy?",
        saveTarget: "both",
        initialCheckIn: null,
        initialDailyLog: null,
    });

    const snapshot = useMemo(
        () => estimateCycle(data.settings, data.cycles, data.dailyLogs),
        [data.cycles, data.dailyLogs, data.settings],
    );
    const moments = data.notificationMoments.length > 0 ? data.notificationMoments : createDefaultNotificationMoments();

    async function boot() {
        await initializeDatabase();
        const loaded = await loadAppData();
        setData({
            ...loaded,
            notificationMoments:
                loaded.notificationMoments.length > 0 ? loaded.notificationMoments : createDefaultNotificationMoments(),
        });
        setLoading(false);
    }

    function openQuickCheckIn(momentType: MomentType = "now") {
        setCheckIn({
            visible: true,
            sessionKey: Date.now(),
            mode: "quick",
            momentType,
            question: questionForMoment(momentType),
            saveTarget: "checkIn",
            initialCheckIn: null,
            initialDailyLog: null,
        });
    }

    function editQuickCheckIn(entry: MoodCheckIn) {
        setCheckIn({
            visible: true,
            sessionKey: Date.now(),
            mode: "quick",
            momentType: entry.momentType,
            question: questionForMoment(entry.momentType),
            saveTarget: "checkIn",
            initialCheckIn: entry,
            initialDailyLog: null,
        });
    }

    function editDailyLog(entry: DailyLog) {
        setCheckIn({
            visible: true,
            sessionKey: Date.now(),
            mode: "daily",
            momentType: "now",
            question: "Ajusta tu registro del día",
            saveTarget: "dailyLog",
            initialCheckIn: null,
            initialDailyLog: entry,
        });
    }

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            void boot();
        });

        return () => cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        if (Platform.OS !== "android") {
            return;
        }

        void configureAndroidNavigationBar();

        return () => {
            void NavigationBar.setVisibilityAsync("visible").catch(() => undefined);
        };
    }, []);

    useEffect(() => {
        const subscription = addNotificationResponseReceivedListener((response) => {
            const type = response.notification.request.content.data?.momentType;
            openQuickCheckIn(typeof type === "string" ? (type as MomentType) : "now");
        });
        return () => subscription.remove();
    }, []);

    const refreshData = async () => {
        const loaded = await loadAppData();
        setData({
            ...loaded,
            notificationMoments:
                loaded.notificationMoments.length > 0 ? loaded.notificationMoments : createDefaultNotificationMoments(),
        });
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
        setCheckIn((current) => ({ ...current, visible: false }));
        setSelectedDayIso(null);
        setScheduleVisible(false);
        setSettingsVisible(false);
        setActiveTab("today");
        setData(initialData);
    };

    const handleTabChange = (tab: TabKey) => {
        setSelectedDayIso(null);
        setActiveTab(tab);
    };

    const openDiaryTab = () => {
        setSelectedDayIso(null);
        setActiveTab("diary");
    };

    const openDailyCheckIn = () => {
        setCheckIn({
            visible: true,
            sessionKey: Date.now(),
            mode: "daily",
            momentType: "now",
            question: "¿Cómo te sientes hoy?",
            saveTarget: "both",
            initialCheckIn: null,
            initialDailyLog: null,
        });
    };

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
                onClose={() => setCheckIn((current) => ({ ...current, visible: false }))}
                onDelete={deleteCheckIn}
                onSave={saveCheckIn}
                question={checkIn.question}
                saveTarget={checkIn.saveTarget}
                visible={checkIn.visible}
            />
            <ScheduleModal
                moments={moments}
                onChange={saveMoments}
                onClose={() => setScheduleVisible(false)}
                visible={scheduleVisible}
            />
            <SettingsModal
                moments={moments}
                onClose={() => setSettingsVisible(false)}
                onOpenSchedule={() => {
                    setSettingsVisible(false);
                    setScheduleVisible(true);
                }}
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
                    onBack={() => setSelectedDayIso(null)}
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
                onOpenDay={setSelectedDayIso}
                onOpenQuickCheckIn={() => openQuickCheckIn("now")}
                onOpenCalendar={() => handleTabChange("calendar")}
                onOpenPatterns={() => handleTabChange("patterns")}
                onOpenSettings={() => setSettingsVisible(true)}
                settings={data.settings}
                snapshot={snapshot}
            />
        );
    }
}

async function configureAndroidNavigationBar() {
    try {
        await NavigationBar.setVisibilityAsync("hidden");
    } catch {
        // Some Android builds ignore immersive nav bar APIs. Bottom safe area still keeps tabs reachable.
    }
}

function questionForMoment(momentType: MomentType) {
    if (momentType === "morning") {
        return "¿Cómo despertaste?";
    }

    if (momentType === "night") {
        return "¿Cómo estuvo tu día?";
    }

    return "¿Cómo te sientes ahora?";
}

const styles = StyleSheet.create({
    app: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scene: {
        flex: 1,
    },
    loading: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: "center",
        justifyContent: "center",
    },
});
