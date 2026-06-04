import * as SQLite from "expo-sqlite";

import migrationRegistry, { EXPECTED_SCHEMA_VERSION } from "./migrationRegistry";

interface UserVersionRow {
    user_version: number;
}

/** Aplica pragmas operativos de la base local cada vez que se abre conexion nueva. */
export async function applyConnectionPragmas(database: SQLite.SQLiteDatabase) {
    await database.execAsync(`
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
    `);
}

/** Lee version user_version usada como contrato duro de esquema. */
export async function getSchemaVersion(database: SQLite.SQLiteDatabase) {
    const row = await database.getFirstAsync<UserVersionRow>("PRAGMA user_version");

    return row?.user_version ?? 0;
}

/** Ejecuta migraciones pendientes sobre base limpia o version anterior soportada. */
export default async function runMigrations(database: SQLite.SQLiteDatabase, currentVersion: number) {
    for (const migration of migrationRegistry) {
        if (migration.version <= currentVersion) {
            continue;
        }

        await runMigration(database, migration.sql);
    }

    const nextVersion = await getSchemaVersion(database);
    if (nextVersion !== EXPECTED_SCHEMA_VERSION) {
        throw new Error(`SQLite schema version ${nextVersion} does not match expected ${EXPECTED_SCHEMA_VERSION}.`);
    }
}

async function runMigration(database: SQLite.SQLiteDatabase, sql: string) {
    if (hasOwnTransaction(sql)) {
        await database.execAsync(sql);
        return;
    }

    await database.withExclusiveTransactionAsync(async (transaction) => {
        await transaction.execAsync(sql);
    });
}

function hasOwnTransaction(sql: string) {
    return /\bBEGIN\b/i.test(sql) || /\bCOMMIT\b/i.test(sql);
}
