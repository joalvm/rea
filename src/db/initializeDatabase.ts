import { DATABASE_VERSION } from "./config";
import { runDatabaseSeeders } from "./seeders/runDatabaseSeeders";
import { buildCreateSchemaStatements, buildDropSchemaStatements } from "./utils/buildSchemaSql";

type ResetDatabaseConnection = {
    execAsync(source: string): Promise<unknown>;
};

type InitializeDatabaseConnection = ResetDatabaseConnection & {
    getFirstAsync(source: string): Promise<{ user_version: number } | null>;
};

const createSchemaSql = buildCreateSchemaStatements().join("\n");
const dropSchemaSql = buildDropSchemaStatements().join("\n");
const markSchemaVersionSql = `
    INSERT OR IGNORE INTO schema_migrations(version, name, applied_at)
    VALUES (${DATABASE_VERSION}, 'schema_v${DATABASE_VERSION}', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'));
`.trim();

export async function resetDatabase(database: ResetDatabaseConnection) {
    await database.execAsync("PRAGMA foreign_keys = OFF;");

    try {
        await database.execAsync(dropSchemaSql);
        await database.execAsync(createSchemaSql);
        await database.execAsync(markSchemaVersionSql);
        await runDatabaseSeeders(database);
        await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
    } finally {
        await database.execAsync("PRAGMA foreign_keys = ON;");
    }
}

export async function initializeDatabase(database: InitializeDatabaseConnection) {
    await database.execAsync("PRAGMA journal_mode = WAL;");
    await database.execAsync("PRAGMA foreign_keys = ON;");

    const versionRow = await database.getFirstAsync("PRAGMA user_version");
    const currentVersion = versionRow?.user_version ?? 0;

    // Proyecto nuevo: cambio de schema fuerza reset total hasta introducir migraciones.
    if (currentVersion !== DATABASE_VERSION) {
        await resetDatabase(database);
        return;
    }

    await runDatabaseSeeders(database);
}
