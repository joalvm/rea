import * as SQLite from "expo-sqlite";

import seedContentCatalogs from "@/modules/content/contentSeed";
import runMigrations, { applyConnectionPragmas, getSchemaVersion } from "./migrations/migrationRunner";
import { EXPECTED_SCHEMA_VERSION } from "./migrations/migrationRegistry";

export const DATABASE_NAME = "rea.db";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Devuelve conexion SQLite inicializada con esquema vigente y seeds locales idempotentes. */
export default function getDatabase() {
    databasePromise ??= openInitializedDatabase();

    return databasePromise;
}

/** Cierra conexion cacheada para flujos que reemplazan o recrean archivo SQLite. */
export async function closeDatabaseConnection() {
    if (!databasePromise) {
        return;
    }

    const database = await databasePromise;
    await database.closeAsync();
    databasePromise = null;
}

/** Reabre base desde cero cuando reset o importacion reemplazan archivo completo. */
export async function reopenDatabase() {
    await closeDatabaseConnection();
    databasePromise = openInitializedDatabase();

    return databasePromise;
}

/** Borra archivo local y aplica contrato actual, sin compatibilidad con esquemas previos. */
export async function recreateDatabase() {
    await closeDatabaseConnection();
    await SQLite.deleteDatabaseAsync(DATABASE_NAME);
    databasePromise = openInitializedDatabase();

    return databasePromise;
}

async function openInitializedDatabase() {
    let database = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await applyConnectionPragmas(database);

    const version = await getSchemaVersion(database);
    if (version > EXPECTED_SCHEMA_VERSION) {
        throw new Error(`SQLite schema version ${version} is newer than app supports.`);
    }

    if (version === 0 && !(await isEmptyDatabase(database))) {
        await database.closeAsync();
        await SQLite.deleteDatabaseAsync(DATABASE_NAME);
        database = await SQLite.openDatabaseAsync(DATABASE_NAME);
        await applyConnectionPragmas(database);
    }

    const currentVersion = await getSchemaVersion(database);
    if (currentVersion < EXPECTED_SCHEMA_VERSION) {
        await runMigrations(database, currentVersion);
    }

    await assertRequiredSchema(database);
    await seedContentCatalogs(database);

    return database;
}

async function isEmptyDatabase(database: SQLite.SQLiteDatabase) {
    const rows = await database.getAllAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
    );

    return rows.length === 0;
}

async function assertRequiredSchema(database: SQLite.SQLiteDatabase) {
    const rows = await database.getAllAsync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
    );
    const tableNames = new Set(rows.map((row) => row.name));
    const requiredTables = [
        "schema_migrations",
        "user_profile",
        "reproductive_intent_history",
        "period_runs",
        "symptom_catalog",
        "medication_catalog",
        "checkins",
        "checkin_symptoms",
        "checkin_medications",
        "daily_summary",
        "content_sources",
        "content_items",
        "content_rules",
        "content_delivery_log",
    ];
    const missingTables = requiredTables.filter((tableName) => !tableNames.has(tableName));

    if (missingTables.length > 0) {
        throw new Error(`SQLite schema missing tables: ${missingTables.join(", ")}.`);
    }
}
