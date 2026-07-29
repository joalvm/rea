import type { DatabaseMigration } from "./types";

export const migrateV6ToV7: DatabaseMigration = {
    from: 6,
    to: 7,
    name: "schema_v7",
    async up(database) {
        await database.execAsync(`
            ALTER TABLE app_settings
            ADD COLUMN discreet_calendar INTEGER NOT NULL DEFAULT 0
            CHECK (discreet_calendar IN (0, 1));
        `);
        await database.execAsync(`
            ALTER TABLE app_settings
            ADD COLUMN last_backup_at TEXT;
        `);
    },
};
