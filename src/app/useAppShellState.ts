import { useCallback, useEffect, useState } from "react";
import { BackHandler } from "react-native";

import { TabKey } from "../types/app.types";
import { DailyLog, MomentType, MoodCheckIn } from "../types/records.types";
import { CheckInState } from "./app-shell.types";

const initialCheckInState: CheckInState = {
    visible: false,
    sessionKey: 0,
    mode: "daily",
    momentType: "now",
    question: "¿Cómo te sientes hoy?",
    saveTarget: "both",
    initialCheckIn: null,
    initialDailyLog: null,
};

/** Centraliza estado visual del shell: tabs, detalle, modales y sesión de check-in. */
export default function useAppShellState() {
    const [activeTab, setActiveTab] = useState<TabKey>("today");
    const [selectedDayIso, setSelectedDayIso] = useState<string | null>(null);
    const [scheduleVisible, setScheduleVisible] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [checkIn, setCheckIn] = useState<CheckInState>(initialCheckInState);

    useEffect(() => {
        if (!selectedDayIso) {
            return;
        }

        const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
            setSelectedDayIso(null);
            return true;
        });

        return () => subscription.remove();
    }, [selectedDayIso]);

    const openQuickCheckIn = useCallback((momentType: MomentType = "now") => {
        setCheckIn(
            buildVisibleCheckInState({
                mode: "quick",
                momentType,
                question: questionForMoment(momentType),
                saveTarget: "checkIn",
                initialCheckIn: null,
                initialDailyLog: null,
            }),
        );
    }, []);

    function openDailyCheckIn() {
        setCheckIn(
            buildVisibleCheckInState({
                mode: "daily",
                momentType: "now",
                question: "¿Cómo te sientes hoy?",
                saveTarget: "both",
                initialCheckIn: null,
                initialDailyLog: null,
            }),
        );
    }

    function editQuickCheckIn(entry: MoodCheckIn) {
        setCheckIn(
            buildVisibleCheckInState({
                mode: "quick",
                momentType: entry.momentType,
                question: questionForMoment(entry.momentType),
                saveTarget: "checkIn",
                initialCheckIn: entry,
                initialDailyLog: null,
            }),
        );
    }

    function editDailyLog(entry: DailyLog) {
        setCheckIn(
            buildVisibleCheckInState({
                mode: "daily",
                momentType: "now",
                question: "Ajusta tu registro del día",
                saveTarget: "dailyLog",
                initialCheckIn: null,
                initialDailyLog: entry,
            }),
        );
    }

    function closeCheckIn() {
        setCheckIn((current) => ({ ...current, visible: false }));
    }

    function closeSchedule() {
        setScheduleVisible(false);
    }

    function closeSettings() {
        setSettingsVisible(false);
    }

    function openSettings() {
        setSettingsVisible(true);
    }

    function openScheduleFromSettings() {
        setSettingsVisible(false);
        setScheduleVisible(true);
    }

    function openDay(iso: string) {
        setSelectedDayIso(iso);
    }

    function closeDay() {
        setSelectedDayIso(null);
    }

    function handleTabChange(tab: TabKey) {
        setSelectedDayIso(null);
        setActiveTab(tab);
    }

    function openDiaryTab() {
        setSelectedDayIso(null);
        setActiveTab("diary");
    }

    function resetShellView() {
        setCheckIn((current) => ({ ...current, visible: false }));
        setSelectedDayIso(null);
        setScheduleVisible(false);
        setSettingsVisible(false);
        setActiveTab("today");
    }

    return {
        activeTab,
        checkIn,
        closeCheckIn,
        closeDay,
        closeSchedule,
        closeSettings,
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
    };
}

/** Genera sesión nueva del modal y evita repetir forma base del estado. */
function buildVisibleCheckInState(config: Omit<CheckInState, "visible" | "sessionKey">): CheckInState {
    return {
        visible: true,
        sessionKey: Date.now(),
        ...config,
    };
}

/** Traduce momento del día al prompt usado en check-ins rápidos. */
function questionForMoment(momentType: MomentType) {
    if (momentType === "morning") {
        return "¿Cómo despertaste?";
    }

    if (momentType === "night") {
        return "¿Cómo estuvo tu día?";
    }

    return "¿Cómo te sientes ahora?";
}
