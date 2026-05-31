import { addNotificationResponseReceivedListener } from "expo-notifications/build/NotificationsEmitter";
import { File } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Linking } from "react-native";

import {
    BACKUP_IMPORT_FILE_HINT,
    BACKUP_SHARE_MIME_TYPE,
    isLikelyBackupUri,
} from "../modules/storage/services/backupFile";
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
import exportAppBackup from "../modules/storage/services/exportAppBackup";
import importAppBackup from "../modules/storage/services/importAppBackup";
import loadAppData from "../modules/storage/services/loadAppData";
import resetAppData from "../modules/storage/services/resetAppData";
import saveBackupToDevice, { getLatestSavedBackup } from "../modules/storage/services/saveBackupToDevice";
import syncObservedCyclesFromDailyLogs from "../modules/storage/services/syncObservedCycles";
import { ExportSavedNotice } from "../features/settings/settings.types";
import { AppData, TabKey } from "../types/app.types";
import { NotificationMoment } from "../types/notifications.types";
import { DailyLog, MomentType, MoodCheckIn } from "../types/records.types";
import { AppSettings } from "../types/settings.types";
import { CheckInState, initialData } from "./app-shell.types";

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

registerNotificationHandler();

/** Encapsula bootstrap, listeners y acciones raíz usadas por AppShell. */
export default function useAppShellController() {
    const pendingIncomingBackupUri = useRef<string | null>(null);
    const lastIncomingShareKey = useRef<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AppData>(initialData);
    const [activeTab, setActiveTab] = useState<TabKey>("today");
    const [selectedDayIso, setSelectedDayIso] = useState<string | null>(null);
    const [scheduleVisible, setScheduleVisible] = useState(false);
    const [settingsVisible, setSettingsVisible] = useState(false);
    const [exportSavedNotice, setExportSavedNotice] = useState<ExportSavedNotice | null>(null);
    const [exportingBackup, setExportingBackup] = useState(false);
    const [importingBackup, setImportingBackup] = useState(false);
    const [checkIn, setCheckIn] = useState<CheckInState>(initialCheckInState);

    const snapshot = useMemo(
        () => estimateCycle(data.settings, data.cycles, data.dailyLogs),
        [data.cycles, data.dailyLogs, data.settings],
    );
    const moments = data.notificationMoments.length > 0 ? data.notificationMoments : createDefaultNotificationMoments();
    const incomingShare = Sharing.useIncomingShare();

    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            void boot();
        });

        return () => cancelAnimationFrame(frame);
    }, []);

    useEffect(() => {
        const subscription = addNotificationResponseReceivedListener((response) => {
            const type = response.notification.request.content.data?.momentType;
            openQuickCheckIn(typeof type === "string" ? (type as MomentType) : "now");
        });

        return () => subscription.remove();
    }, []);

    useEffect(() => {
        if (!exportSavedNotice) {
            return;
        }

        const timeoutId = setTimeout(() => {
            setExportSavedNotice(null);
        }, 6500);

        return () => clearTimeout(timeoutId);
    }, [exportSavedNotice]);

    const refreshData = useCallback(async () => {
        const loaded = await loadAppData();
        setData(normalizeAppData(loaded));
    }, []);

    const runBackupImport = useCallback(
        async (backupUri: string) => {
            if (exportingBackup || importingBackup) {
                return;
            }

            try {
                setImportingBackup(true);

                await importAppBackup(backupUri);

                const restoredData = await loadAppData();
                if (restoredData.notificationMoments.length > 0) {
                    const rescheduledMoments = await rescheduleNotificationMoments(restoredData.notificationMoments);
                    await saveNotificationMoments(rescheduledMoments);
                } else {
                    await clearScheduledNotifications();
                }

                await refreshData();
                setCheckIn((current) => ({ ...current, visible: false }));
                setScheduleVisible(false);
                setSettingsVisible(false);
                setActiveTab("today");
                setSelectedDayIso(null);

                Alert.alert("Respaldo importado", "Tus registros volvieron a este teléfono.");
            } catch (error) {
                Alert.alert(
                    "No pude importar el respaldo",
                    getErrorMessage(error, "Revisa que sea un respaldo válido creado por Rea."),
                );
            } finally {
                pendingIncomingBackupUri.current = null;
                setImportingBackup(false);
            }
        },
        [exportingBackup, importingBackup, refreshData],
    );

    const promptBackupImport = useCallback(
        (backupUri: string, sourceLabel: string) => {
            if (exportingBackup || importingBackup || pendingIncomingBackupUri.current === backupUri) {
                return;
            }

            pendingIncomingBackupUri.current = backupUri;

            Alert.alert(
                "Importar respaldo",
                buildBackupImportMessage(sourceLabel),
                [
                    {
                        text: "Cancelar",
                        style: "cancel",
                        onPress: () => {
                            pendingIncomingBackupUri.current = null;
                        },
                    },
                    {
                        text: "Importar",
                        style: "destructive",
                        onPress: () => {
                            void runBackupImport(backupUri);
                        },
                    },
                ],
                {
                    cancelable: true,
                    onDismiss: () => {
                        pendingIncomingBackupUri.current = null;
                    },
                },
            );
        },
        [exportingBackup, importingBackup, runBackupImport],
    );

    async function boot() {
        await initializeDatabase();
        const loaded = await loadAppData();
        setData(normalizeAppData(loaded));
        setLoading(false);
    }

    useEffect(() => {
        if (loading) {
            return;
        }

        const subscription = Linking.addEventListener("url", ({ url }) => {
            maybePromptIncomingBackup(url, promptBackupImport);
        });

        void Linking.getInitialURL().then((url) => {
            maybePromptIncomingBackup(url, promptBackupImport);
        });

        return () => subscription.remove();
    }, [loading, promptBackupImport]);

    useEffect(() => {
        if (loading) {
            return;
        }

        const incomingBackup = getIncomingSharedBackup(
            incomingShare.resolvedSharedPayloads,
            incomingShare.sharedPayloads,
        );
        if (!incomingBackup || lastIncomingShareKey.current === incomingBackup.key) {
            return;
        }

        lastIncomingShareKey.current = incomingBackup.key;
        incomingShare.clearSharedPayloads();
        promptBackupImport(incomingBackup.uri, incomingBackup.sourceLabel);
    }, [
        incomingShare,
        incomingShare.resolvedSharedPayloads,
        incomingShare.sharedPayloads,
        loading,
        promptBackupImport,
    ]);

    function openQuickCheckIn(momentType: MomentType = "now") {
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
    }

    const openDailyCheckIn = () => {
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
    };

    const editQuickCheckIn = (entry: MoodCheckIn) => {
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
    };

    const editDailyLog = (entry: DailyLog) => {
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
    };

    const closeCheckIn = () => {
        setCheckIn((current) => ({ ...current, visible: false }));
    };

    const closeSchedule = () => {
        setScheduleVisible(false);
    };

    const closeSettings = () => {
        setExportSavedNotice(null);
        setSettingsVisible(false);
    };

    const openSettings = () => {
        setSettingsVisible(true);
    };

    const openScheduleFromSettings = () => {
        setSettingsVisible(false);
        setScheduleVisible(true);
    };

    const openDay = (iso: string) => {
        setSelectedDayIso(iso);
    };

    const closeDay = () => {
        setSelectedDayIso(null);
    };

    const handleTabChange = (tab: TabKey) => {
        setSelectedDayIso(null);
        setActiveTab(tab);
    };

    const openDiaryTab = () => {
        setSelectedDayIso(null);
        setActiveTab("diary");
    };

    const exportBackup = async () => {
        if (exportingBackup || importingBackup) {
            return;
        }

        try {
            setExportingBackup(true);

            const backupFile = await exportAppBackup();
            const savedBackup = await saveBackupToDevice(backupFile);
            const sharingAvailable = await Sharing.isAvailableAsync();
            const savedBackupUri = savedBackup.file.uri;

            setExportSavedNotice(
                buildExportSavedNotice(
                    savedBackup.file.name,
                    savedBackupUri,
                    savedBackup.folderLabel,
                    sharingAvailable,
                ),
            );

            if (sharingAvailable) {
                try {
                    await shareBackupFile(savedBackupUri);
                } catch (error) {
                    Alert.alert(
                        "No pude abrir compartir",
                        getErrorMessage(error, "El respaldo quedó guardado en este teléfono."),
                    );
                }
            }
        } catch (error) {
            Alert.alert("No pude exportar tu respaldo", getErrorMessage(error, "Intenta de nuevo en unos segundos."));
        } finally {
            setExportingBackup(false);
        }
    };

    const dismissExportSavedNotice = () => {
        setExportSavedNotice(null);
    };

    const shareSavedBackup = async () => {
        if (!exportSavedNotice?.canShare) {
            return;
        }

        try {
            await shareBackupFile(exportSavedNotice.fileUri);

            setExportSavedNotice(null);
        } catch (error) {
            Alert.alert("No pude compartir tu respaldo", getErrorMessage(error, "Intenta de nuevo en unos segundos."));
        }
    };

    const openBackupFilePicker = useCallback(async () => {
        try {
            const result = await File.pickFileAsync({ mimeTypes: "*/*" });

            if (result.canceled) {
                return;
            }

            const selectedBackup = result.result;
            if (!selectedBackup) {
                throw new Error("No recibí ningún archivo para importar.");
            }

            promptBackupImport(selectedBackup.uri, `el archivo ${selectedBackup.name}`);
        } catch (error) {
            Alert.alert(
                "No pude importar el respaldo",
                getErrorMessage(error, `Busca un respaldo ${BACKUP_IMPORT_FILE_HINT} creado por Rea.`),
            );
        }
    }, [promptBackupImport]);

    const importBackup = async () => {
        if (exportingBackup || importingBackup) {
            return;
        }

        const latestSavedBackup = getLatestSavedBackup();
        if (!latestSavedBackup) {
            await openBackupFilePicker();
            return;
        }

        Alert.alert(
            "Importar respaldo",
            `Encontré ${latestSavedBackup.name} guardado por Rea en este teléfono.`,
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Buscar otro",
                    onPress: () => {
                        void openBackupFilePicker();
                    },
                },
                {
                    text: "Usar este",
                    style: "destructive",
                    onPress: () => {
                        promptBackupImport(latestSavedBackup.uri, `el respaldo ${latestSavedBackup.name}`);
                    },
                },
            ],
            { cancelable: true },
        );
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

    return {
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
    };
}

/** Rehidrata defaults locales para que el shell siempre tenga momentos utilizables. */
function normalizeAppData(loaded: AppData): AppData {
    return {
        ...loaded,
        notificationMoments:
            loaded.notificationMoments.length > 0 ? loaded.notificationMoments : createDefaultNotificationMoments(),
    };
}

/** Genera una sesión nueva del modal y evita repetir la forma base del estado. */
function buildVisibleCheckInState(config: Omit<CheckInState, "visible" | "sessionKey">): CheckInState {
    return {
        visible: true,
        sessionKey: Date.now(),
        ...config,
    };
}

/** Traduce el momento del día al prompt usado en check-ins rápidos. */
function questionForMoment(momentType: MomentType) {
    if (momentType === "morning") {
        return "¿Cómo despertaste?";
    }

    if (momentType === "night") {
        return "¿Cómo estuvo tu día?";
    }

    return "¿Cómo te sientes ahora?";
}

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error && error.message ? error.message : fallback;
}

function maybePromptIncomingBackup(
    url: string | null,
    promptBackupImport: (backupUri: string, sourceLabel: string) => void,
) {
    if (!url || !isIncomingBackupUrl(url)) {
        return;
    }

    promptBackupImport(url, "el archivo que abriste");
}

function isIncomingBackupUrl(url: string) {
    return url.startsWith("content://") || url.startsWith("file://") || isLikelyBackupUri(url);
}

function getIncomingSharedBackup(
    resolvedPayloads: Sharing.ResolvedSharePayload[],
    sharedPayloads: Sharing.SharePayload[],
) {
    const resolvedBackup = resolvedPayloads.find((payload) =>
        isLikelySharedBackup(payload.contentUri ?? payload.value, payload.originalName, payload.contentMimeType),
    );
    if (resolvedBackup?.contentUri) {
        return {
            key: `${resolvedBackup.contentUri}|${resolvedBackup.originalName ?? ""}`,
            uri: resolvedBackup.contentUri,
            sourceLabel: resolvedBackup.originalName
                ? `el archivo ${resolvedBackup.originalName}`
                : "el archivo que abriste",
        };
    }

    const sharedBackup = sharedPayloads.find((payload) =>
        isLikelySharedBackup(payload.value, null, payload.mimeType ?? null),
    );
    if (!sharedBackup) {
        return null;
    }

    return {
        key: `${sharedBackup.value}|${sharedBackup.mimeType ?? ""}`,
        uri: sharedBackup.value,
        sourceLabel: "el archivo que abriste",
    };
}

function isLikelySharedBackup(uri: string, fileName?: string | null, mimeType?: string | null) {
    return (
        mimeType === BACKUP_SHARE_MIME_TYPE ||
        isLikelyBackupUri(uri) ||
        Boolean(fileName && isLikelyBackupUri(fileName))
    );
}

function buildBackupImportMessage(sourceLabel: string) {
    return `Se reemplazarán los registros actuales por ${sourceLabel}. Solo continúa si reconoces ese respaldo.`;
}

async function shareBackupFile(fileUri: string) {
    await Sharing.shareAsync(fileUri, {
        dialogTitle: "Compartir respaldo de Rea",
        mimeType: BACKUP_SHARE_MIME_TYPE,
    });
}

function buildExportSavedNotice(
    fileName: string,
    fileUri: string,
    folderLabel: string,
    canShare: boolean,
): ExportSavedNotice {
    return {
        fileName,
        fileUri,
        message: `Se guardó en ${folderLabel}.`,
        canShare,
    };
}
