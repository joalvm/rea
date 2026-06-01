import { File } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Linking } from "react-native";

import { ExportSavedNotice } from "../../features/settings/settings.types";
import {
    BACKUP_IMPORT_FILE_HINT,
    BACKUP_SHARE_MIME_TYPE,
    isLikelyBackupUri,
} from "../../modules/storage/services/backupFile";
import clearScheduledNotifications from "../../modules/notifications/scheduler/clearScheduledNotifications";
import rescheduleNotificationCadence from "../../modules/notifications/scheduler/rescheduleNotificationCadence";
import { saveNotificationCadence } from "../../modules/storage/repositories/notificationMoments.repository";
import exportAppBackup from "../../modules/storage/services/exportAppBackup";
import importAppBackup from "../../modules/storage/services/importAppBackup";
import loadAppData from "../../modules/storage/services/loadAppData";
import saveBackupToDevice, { getLatestSavedBackup } from "../../modules/storage/services/saveBackupToDevice";

interface UseAppBackupControllerParams {
    loading: boolean;
    refreshData: () => Promise<void>;
    resetShellView: () => void;
}

/** Contrato de salida de useAppBackupController para flujos de respaldo del shell. */
export interface UseAppBackupControllerResult {
    /** Oculta aviso temporal de respaldo exportado. */
    dismissExportSavedNotice: () => void;
    /** Exporta respaldo local actual y lo comparte si dispositivo lo permite. */
    exportBackup: () => Promise<void>;
    /** Aviso actual asociado a último respaldo guardado. */
    exportSavedNotice: ExportSavedNotice | null;
    /** Indica si flujo de exportación está corriendo. */
    exportingBackup: boolean;
    /** Abre flujo de importación desde archivo reciente o picker. */
    importBackup: () => Promise<void>;
    /** Indica si flujo de importación está corriendo. */
    importingBackup: boolean;
    /** Reintenta compartir respaldo ya guardado en dispositivo. */
    shareSavedBackup: () => Promise<void>;
}

/** Encapsula flujo de respaldo local: detectar, importar, exportar y compartir. */
export default function useAppBackupController({
    loading,
    refreshData,
    resetShellView,
}: UseAppBackupControllerParams): UseAppBackupControllerResult {
    const pendingIncomingBackupUri = useRef<string | null>(null);
    const lastIncomingShareKey = useRef<string | null>(null);
    const [exportSavedNotice, setExportSavedNotice] = useState<ExportSavedNotice | null>(null);
    const [exportingBackup, setExportingBackup] = useState(false);
    const [importingBackup, setImportingBackup] = useState(false);
    const incomingShare = Sharing.useIncomingShare();

    useEffect(() => {
        if (!exportSavedNotice) {
            return;
        }

        const timeoutId = setTimeout(() => {
            setExportSavedNotice(null);
        }, 6500);

        return () => clearTimeout(timeoutId);
    }, [exportSavedNotice]);

    const runBackupImport = useCallback(
        async (backupUri: string) => {
            if (exportingBackup || importingBackup) {
                return;
            }

            try {
                setImportingBackup(true);

                await importAppBackup(backupUri);

                const restoredData = await loadAppData();
                if (restoredData.notificationCadence?.enabled) {
                    const scheduledCadence = await rescheduleNotificationCadence(restoredData.notificationCadence);
                    await saveNotificationCadence(scheduledCadence);
                } else {
                    await clearScheduledNotifications();
                }

                await refreshData();
                resetShellView();

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
        [exportingBackup, importingBackup, refreshData, resetShellView],
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

    return {
        dismissExportSavedNotice,
        exportBackup,
        exportSavedNotice,
        exportingBackup,
        importBackup,
        importingBackup,
        shareSavedBackup,
    };
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
