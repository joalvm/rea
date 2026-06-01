import { useCallback, useEffect, useState } from "react";
import { BackHandler } from "react-native";

import { TabKey } from "../../types/app.types";
import { DailyLog, MomentType, MoodCheckIn } from "../../types/records.types";
import { CheckInPromptContext, CheckInState } from "../app-shell.types";

const initialCheckInState: CheckInState = {
    visible: false,
    sessionKey: 0,
    mode: "daily",
    momentType: "now",
    promptContext: {
        title: "¿Cómo te sientes ahora?",
        subtitle: "Registra solo lo que este momento te está mostrando.",
    },
    dailyLogOnly: false,
    initialCheckIn: null,
    initialDailyLog: null,
};

type CheckInPromptSource = "manual" | "notification" | "edit";

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
    editQuickCheckIn: (entry: MoodCheckIn, initialDailyLog?: DailyLog | null) => void;
    /** Cambia pestaña activa y limpia detalle de día si hacía falta. */
    handleTabChange: (tab: TabKey) => void;
    /** Abre check-in diario completo. */
    openDailyCheckIn: (initialDailyLog?: DailyLog | null) => void;
    /** Abre detalle de un día concreto. */
    openDay: (iso: string) => void;
    /** Salta directo a pestaña diario. */
    openDiaryTab: () => void;
    /** Abre check-in rápido para momento de notificación dado. */
    openQuickCheckIn: (
        momentType?: MomentType,
        source?: CheckInPromptSource,
        initialDailyLog?: DailyLog | null,
    ) => void;
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

    const openQuickCheckIn = useCallback(
        (
            momentType: MomentType = "now",
            source: CheckInPromptSource = "manual",
            initialDailyLog: DailyLog | null = null,
        ) => {
            setCheckIn(
                buildVisibleCheckInState({
                    mode: "quick",
                    momentType,
                    promptContext: buildPromptContext({ mode: "quick", momentType, source }),
                    dailyLogOnly: false,
                    initialCheckIn: null,
                    initialDailyLog,
                }),
            );
        },
        [],
    );

    function openDailyCheckIn(initialDailyLog: DailyLog | null = null) {
        setCheckIn(
            buildVisibleCheckInState({
                mode: "daily",
                momentType: "now",
                promptContext: buildPromptContext({ mode: "daily", momentType: "now", source: "manual" }),
                dailyLogOnly: false,
                initialCheckIn: null,
                initialDailyLog,
            }),
        );
    }

    function editQuickCheckIn(entry: MoodCheckIn, initialDailyLog: DailyLog | null = null) {
        setCheckIn(
            buildVisibleCheckInState({
                mode: "quick",
                momentType: entry.momentType,
                promptContext: buildPromptContext({ mode: "quick", momentType: entry.momentType, source: "edit" }),
                dailyLogOnly: false,
                initialCheckIn: entry,
                initialDailyLog,
            }),
        );
    }

    function editDailyLog(entry: DailyLog) {
        setCheckIn(
            buildVisibleCheckInState({
                mode: "daily",
                momentType: "now",
                promptContext: buildPromptContext({ mode: "daily", momentType: "now", source: "edit" }),
                dailyLogOnly: true,
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

interface BuildPromptContextParams {
    mode: CheckInState["mode"];
    momentType: MomentType;
    source: CheckInPromptSource;
}

/** Mantiene el prompt principal estable y mueve el matiz al contexto secundario. */
function buildPromptContext({ mode, momentType, source }: BuildPromptContextParams): CheckInPromptContext {
    if (source === "notification") {
        return {
            title: "¿Cómo te sientes ahora?",
            subtitle: "Vienes de un recordatorio suave. Responde solo si este momento te aporta algo.",
        };
    }

    if (source === "edit") {
        return {
            title: "¿Cómo te sientes ahora?",
            subtitle:
                mode === "daily"
                    ? "Puedes corregir o completar lo que observaste hoy sin rehacer todo el registro."
                    : "Ajusta esta nota puntual sin tocar el resto del día.",
        };
    }

    if (mode === "daily") {
        return {
            title: "¿Cómo te sientes ahora?",
            subtitle: "Añade las señales del día que sí valen la pena, aunque no completes todo.",
        };
    }

    if (momentType === "morning") {
        return {
            title: "¿Cómo te sientes ahora?",
            subtitle: "Si acabas de despertar, basta con dejar una foto rápida de este momento.",
        };
    }

    if (momentType === "night") {
        return {
            title: "¿Cómo te sientes ahora?",
            subtitle: "Si estás cerrando el día, anota solo lo que todavía sigue presente.",
        };
    }

    return {
        title: "¿Cómo te sientes ahora?",
        subtitle: "Registra solo lo que este momento te está mostrando.",
    };
}
