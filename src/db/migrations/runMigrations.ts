import { DATABASE_VERSION } from "../config";
import { databaseMigrations } from "./registry";
import type { DatabaseMigration, MigrationConnection } from "./types";

export async function runDatabaseMigrations(database: MigrationConnection, currentVersion: number) {
    if (currentVersion > DATABASE_VERSION) {
        throw new Error(
            `La base de datos está en la versión ${currentVersion}, pero esta app solo soporta hasta ${DATABASE_VERSION}.`,
        );
    }

    let version = currentVersion;

    while (version < DATABASE_VERSION) {
        const migration = findMigration(version);

        await database.execAsync("BEGIN IMMEDIATE;");

        try {
            await migration.up(database);
            await database.execAsync(`
                INSERT INTO schema_migrations(version, name, applied_at)
                VALUES (${migration.to}, '${migration.name}', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'));
            `);
            await database.execAsync(`PRAGMA user_version = ${migration.to};`);
            await database.execAsync("COMMIT;");
        } catch (error) {
            await rollbackDatabase(database);
            throw error;
        }

        version = migration.to;
    }
}

function findMigration(version: number): DatabaseMigration {
    const migration = databaseMigrations.find((candidate) => candidate.from === version);

    if (migration) {
        return migration;
    }

    throw new Error(
        `No existe una migración segura desde la versión ${version} hasta la ${DATABASE_VERSION}. No se eliminarán datos automáticamente.`,
    );
}

async function rollbackDatabase(database: MigrationConnection) {
    try {
        await database.execAsync("ROLLBACK;");
    } catch {
        // Conserva el error original de la migración aunque el rollback falle.
    }
}
