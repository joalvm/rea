import { useCallback, useEffect, useState } from "react";
import { BackHandler } from "react-native";

import { TabKey } from "../../types/app.types";
import { DailyLog, MomentType, MoodCheckIn } from "../../types/records.types";
import { CheckInState } from "../app-shell.types";

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

/** Contrato de salida de useAppShellState para pantallas y componentes del shell. */
export interface UseAppShellStateResult {
    /** Pestaña principal visible en el shell raíz. */
    activeTab: TabKey;
    /** Sesión completa del modal de check-in activo. */
    checkIn: CheckInState;
    /** Oculta modal de check-in actual. */
    closeCheckIn: () => void;
    /** Sale del detalle de día abierto. */
    closeDay: () => void;
    /** Cierra modal de horario de notificaciones. */
    closeSchedule: () => void;
    /** Cierra modal principal de ajustes. */
    closeSettings: () => void;
    /** Reabre modal rápido con datos de check-in existentes. */
    editDailyLog: (entry: DailyLog) => void;
    /** Reabre modal rápido con datos de check-in existentes. */
    editQuickCheckIn: (entry: MoodCheckIn) => void;
    /** Cambia pestaña activa y limpia detalle de día si hacía falta. */
    handleTabChange: (tab: TabKey) => void;
    /** Abre check-in diario completo. */
    openDailyCheckIn: () => void;
    /** Abre detalle de un día concreto. */
    openDay: (iso: string) => void;
    /** Salta directo a pestaña diario. */
    openDiaryTab: () => void;
    /** Abre check-in rápido para momento de notificación dado. */
    openQuickCheckIn: (momentType?: MomentType) => void;
    /** Cierra ajustes y abre modal de horario. */
    openScheduleFromSettings: () => void;
    /** Abre modal principal de ajustes. */
    openSettings: () => void;
    /** Devuelve shell a estado visual base tras reset o importación. */
    resetShellView: () => void;
    /** Visibilidad actual del modal de horario. */
    scheduleVisible: boolean;
    /** Día actualmente seleccionado en detalle, si existe. */
    selectedDayIso: string | null;
    /** Visibilidad actual del modal de ajustes. */
    settingsVisible: boolean;
}

/** Centraliza estado visual del shell: tabs, detalle, modales y sesión de check-in. */
export default function useAppShellState(): UseAppShellStateResult {
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
