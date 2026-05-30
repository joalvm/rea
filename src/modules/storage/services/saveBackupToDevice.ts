import { Directory, File, Paths } from "expo-file-system";

const APP_BACKUP_DIRECTORY_NAME = "rea-backups";
const APP_BACKUP_DIRECTORY_LABEL = "Respaldos de Rea";

export interface SavedBackupResult {
    file: File;
    folderLabel: string;
}

/** Guarda respaldo en carpeta local estable para evitar pasos extra antes de compartirlo. */
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
