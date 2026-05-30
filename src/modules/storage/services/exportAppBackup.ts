import * as SQLite from "expo-sqlite";
import { Directory, File, Paths } from "expo-file-system";

import db from "../core/database";

const BACKUP_DIRECTORY_NAME = "backups";
const BACKUP_FILE_PREFIX = "rea-backup";
const MAIN_DATABASE_NAME = "main";

/** Genera una copia SQLite autocontenida lista para guardar fuera de la app. */
export default async function exportAppBackup() {
    const backupDirectory = new Directory(Paths.cache, BACKUP_DIRECTORY_NAME);
    backupDirectory.create({ idempotent: true, intermediates: true });

    const fileName = `${BACKUP_FILE_PREFIX}-${buildBackupStamp()}.sqlite`;
    const backupDatabase = await SQLite.openDatabaseAsync(fileName, { useNewConnection: true }, backupDirectory.uri);

    try {
        await SQLite.backupDatabaseAsync({
            sourceDatabase: db(),
            sourceDatabaseName: MAIN_DATABASE_NAME,
            destDatabase: backupDatabase,
            destDatabaseName: MAIN_DATABASE_NAME,
        });
    } finally {
        await backupDatabase.closeAsync();
    }

    return new File(backupDirectory, fileName);
}

/** Construye un sufijo estable y único para no colisionar respaldos temporales. */
function buildBackupStamp() {
    const now = new Date();

    return [
        now.getFullYear(),
        padNumber(now.getMonth() + 1),
        padNumber(now.getDate()),
        "-",
        padNumber(now.getHours()),
        padNumber(now.getMinutes()),
        padNumber(now.getSeconds()),
        "-",
        now.getMilliseconds().toString().padStart(3, "0"),
    ].join("");
}

function padNumber(value: number) {
    return value.toString().padStart(2, "0");
}
