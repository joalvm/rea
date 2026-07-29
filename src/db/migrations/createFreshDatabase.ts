import { DATABASE_VERSION } from "../config";
import { buildCreateSchemaStatements } from "../utils/buildSchemaSql";
import type { MigrationConnection } from "./types";

const createSchemaSql = buildCreateSchemaStatements().join("\n");

export async function createFreshDatabase(database: MigrationConnection) {
    await database.execAsync("BEGIN IMMEDIATE;");

    try {
        await database.execAsync(createSchemaSql);
        await database.execAsync(`
            INSERT INTO schema_migrations(version, name, applied_at)
            VALUES (${DATABASE_VERSION}, 'schema_v${DATABASE_VERSION}', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'));
        `);
        await database.execAsync(`PRAGMA user_version = ${DATABASE_VERSION};`);
        await database.execAsync("COMMIT;");
    } catch (error) {
        await rollbackDatabase(database);
        throw error;
    }
}

async function rollbackDatabase(database: MigrationConnection) {
    try {
        await database.execAsync("ROLLBACK;");
    } catch {
        // Conserva el error original de la creación aunque el rollback falle.
    }
}
