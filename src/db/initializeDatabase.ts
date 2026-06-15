import type { SQLiteDatabase } from "expo-sqlite";

import { DATABASE_VERSION } from "./connection";
import { buildCreateSchemaStatements, buildDropSchemaStatements } from "./utils/buildSchemaSql";

const createSchemaSql = buildCreateSchemaStatements().join("\n");
const dropSchemaSql = buildDropSchemaStatements().join("\n");

export async function resetDatabase(database: SQLiteDatabase) {
    await database.execAsync("PRAGMA foreign_keys = OFF;");

    try {
        await database.execAsync(dropSchemaSql);
        await database.execAsync(createSchemaSql);
        await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
    } finally {
        await database.execAsync("PRAGMA foreign_keys = ON;");
    }
}

export async function initializeDatabase(database: SQLiteDatabase) {
    await database.execAsync("PRAGMA journal_mode = WAL;");
    await database.execAsync("PRAGMA foreign_keys = ON;");

    const versionRow = await database.getFirstAsync<{ user_version: number }>("PRAGMA user_version");
    const currentVersion = versionRow?.user_version ?? 0;

    // Proyecto nuevo: cambio de schema fuerza reset total hasta introducir migraciones.
    if (currentVersion !== DATABASE_VERSION) {
        await resetDatabase(database);
    }
}
