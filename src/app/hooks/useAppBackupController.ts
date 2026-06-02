import { File } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Linking } from "react-native";

import { translate } from "@/modules/localization/i18n";
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

                Alert.alert(
                    translate("settings:backup.import.successTitle"),
                    translate("settings:backup.import.successBody"),
                );
            } catch (error) {
                Alert.alert(
                    translate("settings:backup.import.cannotImport"),
                    getErrorMessage(error, translate("settings:backup.import.fallbackInvalid")),
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
                translate("settings:backup.import.title"),
                buildBackupImportMessage(sourceLabel),
                [
                    {
                        text: translate("settings:backup.import.cancel"),
                        style: "cancel",
                        onPress: () => {
                            pendingIncomingBackupUri.current = null;
                        },
                    },
                    {
                        text: translate("settings:backup.import.confirm"),
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
                        translate("settings:backup.export.cannotOpenShare"),
                        getErrorMessage(error, translate("settings:backup.export.fallbackSaved")),
                    );
                }
            }
        } catch (error) {
            Alert.alert(
                translate("settings:backup.export.cannotExport"),
                getErrorMessage(error, translate("settings:backup.export.fallbackRetry")),
            );
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
            Alert.alert(
                translate("settings:backup.export.cannotShare"),
                getErrorMessage(error, translate("settings:backup.export.fallbackRetry")),
            );
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
                throw new Error(translate("settings:backup.import.missingFile"));
            }

            promptBackupImport(
                selectedBackup.uri,
                translate("settings:backup.import.fileLabel", { name: selectedBackup.name }),
            );
        } catch (error) {
            Alert.alert(
                translate("settings:backup.import.cannotImport"),
                getErrorMessage(
                    error,
                    translate("settings:backup.import.fallbackHint", { hint: BACKUP_IMPORT_FILE_HINT }),
                ),
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
            translate("settings:backup.import.title"),
            translate("settings:backup.import.latestFound", { name: latestSavedBackup.name }),
            [
                {
                    text: translate("settings:backup.import.cancel"),
                    style: "cancel",
                },
                {
                    text: translate("settings:backup.import.chooseOther"),
                    onPress: () => {
                        void openBackupFilePicker();
                    },
                },
                {
                    text: translate("settings:backup.import.useThis"),
                    style: "destructive",
                    onPress: () => {
                        promptBackupImport(
                            latestSavedBackup.uri,
                            translate("settings:backup.import.latestBackup", { name: latestSavedBackup.name }),
                        );
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

    promptBackupImport(url, translate("settings:backup.import.incomingFile"));
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
                ? translate("settings:backup.import.fileLabel", { name: resolvedBackup.originalName })
                : translate("settings:backup.import.incomingFile"),
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
        sourceLabel: translate("settings:backup.import.incomingFile"),
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
    return translate("settings:backup.import.message", { sourceLabel });
}

async function shareBackupFile(fileUri: string) {
    await Sharing.shareAsync(fileUri, {
        dialogTitle: translate("settings:backup.export.shareDialogTitle"),
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
        message: translate("settings:backup.export.savedMessage", { folder: folderLabel }),
        canShare,
    };
}
