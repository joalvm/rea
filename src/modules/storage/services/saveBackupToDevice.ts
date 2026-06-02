import { Directory, File, Paths } from "expo-file-system";

import { translate } from "@/modules/localization/i18n";
import { isLikelyBackupUri } from "./backupFile";

const APP_BACKUP_DIRECTORY_NAME = "rea-backups";
const APP_BACKUP_DIRECTORY_LABEL = translate("settings:backup.folderLabel");

export interface SavedBackupResult {
    file: File;
    folderLabel: string;
}

/** Guarda respaldo en carpeta local estable para evitar pedir una ubicación antes de compartirlo. */
export default async function saveBackupToDevice(sourceBackup: File): Promise<SavedBackupResult> {
    const appBackupDirectory = new Directory(Paths.document, APP_BACKUP_DIRECTORY_NAME);
    appBackupDirectory.create({ idempotent: true, intermediates: true });

    const savedBackup = new File(appBackupDirectory, sourceBackup.name);
    await sourceBackup.move(savedBackup, { overwrite: true });

    return {
        file: savedBackup,
        folderLabel: APP_BACKUP_DIRECTORY_LABEL,
    };
}

/** Devuelve el respaldo local más reciente guardado por la app, aunque no sea visible en el selector del sistema. */
export function getLatestSavedBackup() {
    const appBackupDirectory = new Directory(Paths.document, APP_BACKUP_DIRECTORY_NAME);
    if (!appBackupDirectory.exists) {
        return null;
    }

    const backupFiles = appBackupDirectory
        .list()
        .filter((entry): entry is File => entry instanceof File && entry.exists && isLikelyBackupUri(entry.name))
        .sort((left, right) => right.name.localeCompare(left.name));

    return backupFiles[0] ?? null;
}
