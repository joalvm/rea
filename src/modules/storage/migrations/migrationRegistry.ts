import initSql from "./0001_init.sql";

export interface StorageMigration {
    version: number;
    name: string;
    sql: string;
}

/** Migraciones SQLite locales en orden estricto de version. */
const migrationRegistry: StorageMigration[] = [
    {
        version: 1,
        name: "0001_init",
        sql: initSql,
    },
];

export const EXPECTED_SCHEMA_VERSION = migrationRegistry[migrationRegistry.length - 1]?.version ?? 0;

export default migrationRegistry;
