import { createClient, type Client } from "@libsql/client";
import { afterEach, describe, expect, it } from "@jest/globals";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { runDatabaseMigrations } from "@/db/migrations/runMigrations";

type LegacyDatabase = {
    client: Client;
    close(): void;
};

const legacyDatabases: LegacyDatabase[] = [];

afterEach(() => {
    while (legacyDatabases.length > 0) {
        legacyDatabases.pop()?.close();
    }
});

describe("Migraciones incrementales de SQLite", () => {
    it("preserva los registros al actualizar de v6 a v7", async () => {
        const database = await createV6Database();

        await runMigrationsInSqlite(database.client, async (connection) => {
            await runDatabaseMigrations(connection, 6);
        });

        const settings = await database.client.execute(
            "SELECT user_id, discreet_calendar, last_backup_at FROM app_settings",
        );
        const version = await database.client.execute("PRAGMA user_version;");
        const migration = await database.client.execute(
            "SELECT version, name FROM schema_migrations WHERE version = 7;",
        );

        expect(settings.rows).toEqual([
            expect.objectContaining({
                user_id: "legacy-user",
                discreet_calendar: 0,
                last_backup_at: null,
            }),
        ]);
        expect(Number(version.rows[0]?.user_version)).toBe(7);
        expect(migration.rows).toEqual([expect.objectContaining({ version: 7, name: "schema_v7" })]);
    });

    it("revierte el cambio y no registra la migración si falla", async () => {
        const database = await createV6Database();

        await expect(
            runMigrationsInSqlite(database.client, async (connection) => {
                await runDatabaseMigrations(
                    {
                        execAsync: async (source) => {
                            if (source.includes("INSERT INTO schema_migrations")) {
                                throw new Error("metadata failed");
                            }

                            await connection.execAsync(source);
                        },
                    },
                    6,
                );
            }),
        ).rejects.toThrow("metadata failed");

        const columns = await database.client.execute("PRAGMA table_info(app_settings);");
        const version = await database.client.execute("PRAGMA user_version;");
        const migration = await database.client.execute("SELECT version FROM schema_migrations WHERE version = 7;");

        expect(columns.rows.map((column) => column.name)).not.toContain("discreet_calendar");
        expect(columns.rows.map((column) => column.name)).not.toContain("last_backup_at");
        expect(Number(version.rows[0]?.user_version)).toBe(6);
        expect(migration.rows).toEqual([]);
    });
});

async function createV6Database() {
    const dir = mkdtempSync(join(tmpdir(), "rea-migration-test-"));
    const client = createClient({ url: `file:${join(dir, "rea.db").replaceAll("\\", "/")}` });
    legacyDatabases.push({
        client,
        close() {
            client.close();
            try {
                rmSync(dir, { recursive: true, force: true });
            } catch {
                // Windows puede liberar el archivo SQLite después del test.
            }
        },
    });

    await client.executeMultiple(`
        PRAGMA foreign_keys = ON;
        CREATE TABLE schema_migrations (
            version INTEGER PRIMARY KEY NOT NULL,
            name TEXT NOT NULL UNIQUE,
            applied_at TEXT NOT NULL
        ) STRICT;
        CREATE TABLE app_settings (
            user_id TEXT PRIMARY KEY NOT NULL,
            notify_daily_checkin INTEGER NOT NULL DEFAULT 1,
            discreet_notifications INTEGER NOT NULL DEFAULT 1,
            onboarding_completed_at TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        ) STRICT;
        INSERT INTO schema_migrations(version, name, applied_at)
        VALUES (6, 'schema_v6', '2026-07-29T00:00:00Z');
        INSERT INTO app_settings(user_id, onboarding_completed_at, created_at, updated_at)
        VALUES ('legacy-user', '2026-07-29T00:00:00Z', '2026-07-29T00:00:00Z', '2026-07-29T00:00:00Z');
        PRAGMA user_version = 6;
    `);

    return { client };
}

async function runMigrationsInSqlite(
    client: Client,
    task: (connection: { execAsync(source: string): Promise<void> }) => Promise<void>,
) {
    const transaction = await client.transaction("write");
    let closed = false;

    const connection = {
        async execAsync(source: string) {
            const normalizedSource = source.trim();

            if (normalizedSource === "BEGIN IMMEDIATE;") {
                return;
            }

            if (normalizedSource === "COMMIT;") {
                await transaction.commit();
                closed = true;
                return;
            }

            if (normalizedSource === "ROLLBACK;") {
                await transaction.rollback();
                closed = true;
                return;
            }

            await transaction.executeMultiple(source);
        },
    };

    try {
        await task(connection);
    } finally {
        if (!closed) {
            await transaction.rollback();
        }
    }
}
