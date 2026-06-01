import * as SQLite from "expo-sqlite";
import { Directory, File, Paths } from "expo-file-system";

import db from "../core/database";
import initializeDatabase from "../core/schema";

const IMPORT_DIRECTORY_NAME = "backup-imports";
const MAIN_DATABASE_NAME = "main";
const REQUIRED_TABLES = ["app_settings", "cycles", "mood_checkins", "daily_logs"];

/** Restaura un respaldo externo tras validar integridad y forma mínima esperada. */
export default async function importAppBackup(backupUri: string) {
    const backupFile = await copyBackupToImportCache(backupUri);
    const backupDirectory = backupFile.parentDirectory;

    if (!backupFile.exists || !backupDirectory) {
        throw new Error("No pude acceder al archivo de respaldo seleccionado.");
    }

    let importedDatabase: SQLite.SQLiteDatabase | null = null;

    try {
        importedDatabase = await SQLite.openDatabaseAsync(
            backupFile.name,
            { useNewConnection: true },
            backupDirectory.uri,
        );

        await hardenImportedDatabase(importedDatabase);
        await validateImportedDatabase(importedDatabase);

        await SQLite.backupDatabaseAsync({
            sourceDatabase: importedDatabase,
            sourceDatabaseName: MAIN_DATABASE_NAME,
            destDatabase: db(),
            destDatabaseName: MAIN_DATABASE_NAME,
        });
    } finally {
        await importedDatabase?.closeAsync();
        if (backupFile.exists) {
            backupFile.delete();
        }
    }

    await initializeDatabase();
}

async function copyBackupToImportCache(backupUri: string) {
    const importDirectory = new Directory(Paths.cache, IMPORT_DIRECTORY_NAME);
    importDirectory.create({ idempotent: true, intermediates: true });

    const sourceFile = new File(backupUri);
    if (!sourceFile.exists) {
        throw new Error("No pude acceder al archivo de respaldo seleccionado.");
    }

    const cachedBackup = new File(importDirectory, `rea-import-${Date.now()}.rea`);
    await sourceFile.copy(cachedBackup, { overwrite: true });

    return cachedBackup;
}

/** Aplica pragmas defensivos recomendados antes de tocar un SQLite externo. */
async function hardenImportedDatabase(database: SQLite.SQLiteDatabase) {
    await database.execAsync(`
        PRAGMA trusted_schema = OFF;
        PRAGMA cell_size_check = ON;
        PRAGMA mmap_size = 0;
    `);
}

/** Rechaza archivos dañados o que no representan un respaldo válido de Rea. */
async function validateImportedDatabase(database: SQLite.SQLiteDatabase) {
    const integrity = await database.getFirstAsync<Record<string, string>>("PRAGMA integrity_check");
    const integrityValue = integrity ? String(Object.values(integrity)[0]) : null;

    if (integrityValue !== "ok") {
        throw new Error("El archivo no pasa la verificación de integridad de SQLite.");
    }

    const schemaObjects = await database.getAllAsync<{ name: string; type: string }>(
        "SELECT name, type FROM sqlite_master WHERE type IN ('table', 'trigger', 'view')",
    );

    const forbiddenObjects = schemaObjects.filter((item) => item.type !== "table");
    if (forbiddenObjects.length > 0) {
        throw new Error("El respaldo incluye objetos no soportados para una importación segura.");
    }

    const tableNames = new Set(schemaObjects.filter((item) => item.type === "table").map((item) => item.name));
    const missingTables = REQUIRED_TABLES.filter((tableName) => !tableNames.has(tableName));

    if (missingTables.length > 0) {
        throw new Error("El archivo no coincide con formato esperado de respaldo de Rea.");
    }
}
