import { addNotificationResponseReceivedListener } from "expo-notifications/build/NotificationsEmitter";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { BottomTabs } from "./src/components/BottomTabs";
import { CheckInModal } from "./src/components/CheckInModal";
import { ScheduleModal } from "./src/components/ScheduleModal";
import { SettingsModal } from "./src/components/SettingsModal";
import { estimateCycle } from "./src/cycle";
import {
    clearScheduledNotifications,
    createDefaultNotificationMoments,
    rescheduleNotificationMoments,
} from "./src/notifications";
import { CalendarScreen } from "./src/screens/CalendarScreen";
import { DiaryScreen } from "./src/screens/DiaryScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { PatternsScreen } from "./src/screens/PatternsScreen";
import { TodayScreen } from "./src/screens/TodayScreen";
import {
    addCycle,
    addMoodCheckIn,
    initializeDatabase,
    loadAppData,
    resetAppData,
    saveNotificationMoments,
    saveSettings,
    upsertDailyLog,
} from "./src/storage";
import { colors } from "./src/theme";
import { AppData, AppSettings, DailyLog, MomentType, MoodCheckIn, NotificationMoment, TabKey } from "./src/types";

const initialData: AppData = {
    settings: null,
    cycles: [],
    moodCheckIns: [],
    dailyLogs: [],
    notificationMoments: [],
};

interface CheckInState {
    visible: boolean;
    mode: "daily" | "quick";
    momentType: MomentType;
    question: string;
}

export default function App() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AppData>(initialData);
    const [activeTab, setActiveTab] = useState<TabKey>("today");
    const [scheduleVisible, setScheduleVisible] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [checkIn, setCheckIn] = useState<CheckInState>({
        visible: false,
        mode: "daily",
        momentType: "now",
        question: "¿Cómo te sientes hoy?",
    });

    const snapshot = useMemo(() => estimateCycle(data.settings), [data.settings]);
    const moments = data.notificationMoments.length > 0 ? data.notificationMoments : createDefaultNotificationMoments();

    useEffect(() => {
        void boot();
    }, []);

    useEffect(() => {
        const subscription = addNotificationResponseReceivedListener((response) => {
            const type = response.notification.request.content.data?.momentType;
            openQuickCheckIn(typeof type === "string" ? (type as MomentType) : "now");
        });
        return () => subscription.remove();
    }, []);

    const boot = async () => {
        await initializeDatabase();
        const loaded = await loadAppData();
        setData({
            ...loaded,
            notificationMoments:
                loaded.notificationMoments.length > 0 ? loaded.notificationMoments : createDefaultNotificationMoments(),
        });
        setLoading(false);
    };

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

    const saveCheckIn = async (moodCheckIn: MoodCheckIn, dailyLog?: DailyLog) => {
        await addMoodCheckIn(moodCheckIn);
        if (dailyLog) await upsertDailyLog(dailyLog);
        await refreshData();
    };

    const resetApplication = async () => {
        await clearScheduledNotifications();
        await resetAppData();
        setCheckIn((current) => ({ ...current, visible: false }));
        setScheduleVisible(false);
        setSettingsVisible(false);
        setActiveTab("today");
        setData(initialData);
    };

    const openDailyCheckIn = () => {
        setCheckIn({
            visible: true,
            mode: "daily",
            momentType: "now",
            question: "¿Cómo te sientes hoy?",
        });
    };

    const openQuickCheckIn = (momentType: MomentType = "now") => {
        setCheckIn({
            visible: true,
            mode: "quick",
            momentType,
            question: questionForMoment(momentType),
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
            <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
            <CheckInModal
                mode={checkIn.mode}
                momentType={checkIn.momentType}
                onClose={() => setCheckIn((current) => ({ ...current, visible: false }))}
                onSave={saveCheckIn}
                question={checkIn.question}
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
        if (activeTab === "calendar") {
            return (
                <CalendarScreen dailyLogs={data.dailyLogs} onOpenCheckIn={openDailyCheckIn} settings={data.settings} />
            );
        }

        if (activeTab === "diary") {
            return (
                <DiaryScreen
                    dailyLogs={data.dailyLogs}
                    moodCheckIns={data.moodCheckIns}
                    onOpenCheckIn={openDailyCheckIn}
                    onOpenQuickCheckIn={() => openQuickCheckIn("now")}
                />
            );
        }

        if (activeTab === "patterns") {
            return <PatternsScreen dailyLogs={data.dailyLogs} moodCheckIns={data.moodCheckIns} />;
        }

        return (
            <TodayScreen
                dailyLogs={data.dailyLogs}
                moodCheckIns={data.moodCheckIns}
                onOpenCheckIn={openDailyCheckIn}
                onOpenQuickCheckIn={() => openQuickCheckIn("now")}
                onOpenCalendar={() => setActiveTab("calendar")}
                onOpenPatterns={() => setActiveTab("patterns")}
                onOpenSettings={() => setSettingsVisible(true)}
                snapshot={snapshot}
            />
        );
    }
}

function questionForMoment(momentType: MomentType) {
    if (momentType === "morning") return "¿Cómo despertaste?";
    if (momentType === "night") return "¿Cómo estuvo tu día?";
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
