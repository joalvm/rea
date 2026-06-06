import { create } from "zustand";

import clearScheduledNotifications from "@/modules/notifications/scheduler/clearScheduledNotifications";
import rescheduleNotificationCadence from "@/modules/notifications/scheduler/rescheduleNotificationCadence";
import exportAppBackup from "@/modules/storage/services/exportAppBackup";
import importAppBackup from "@/modules/storage/services/importAppBackup";
import loadAppStoreData from "@/modules/storage/services/loadAppStoreData";
import { saveReminderPreferences } from "@/modules/storage/services/profileState";
import saveBackupToDevice, { getLatestSavedBackup } from "@/modules/storage/services/saveBackupToDevice";

import useAppStore from "./useAppStore";

/** Respaldo local guardado y listo para mostrar o compartir desde UI. */
export interface BackupFileSnapshot {
    fileName: string;
    fileUri: string;
    folderLabel: string;
}

/** Respaldo local candidato para restaurar desde ajustes. */
export interface BackupCandidateSnapshot {
    name: string;
    uri: string;
}

interface BackupStoreState {
    exportBackupFile: () => Promise<BackupFileSnapshot>;
    getLatestBackupCandidate: () => BackupCandidateSnapshot | null;
    importBackupFile: (backupUri: string) => Promise<void>;
}

/** Store de operaciones de respaldo; UI no importa servicios de storage. */
const useBackupStore = create<BackupStoreState>(() => ({
    exportBackupFile: async () => {
        const backupFile = await exportAppBackup();
        const savedBackup = await saveBackupToDevice(backupFile);

        return {
            fileName: savedBackup.file.name,
            fileUri: savedBackup.file.uri,
            folderLabel: savedBackup.folderLabel,
        };
    },
    getLatestBackupCandidate: () => {
        const latestBackup = getLatestSavedBackup();
        if (!latestBackup) {
            return null;
        }

        return {
            name: latestBackup.name,
            uri: latestBackup.uri,
        };
    },
    importBackupFile: async (backupUri) => {
        await importAppBackup(backupUri);

        const restoredData = await loadAppStoreData();
        if (restoredData.notificationCadence?.enabled) {
            const scheduledCadence = await rescheduleNotificationCadence(restoredData.notificationCadence);
            await saveReminderPreferences(scheduledCadence);
        } else {
            await clearScheduledNotifications();
        }

        await useAppStore.getState().refreshData();
    },
}));

export default useBackupStore;
