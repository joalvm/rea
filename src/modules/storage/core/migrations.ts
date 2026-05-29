import * as SQLite from "expo-sqlite";

/** Agrega columna faltante sin romper instalaciones previas. */
export default async function ensureTableColumn(
    database: SQLite.SQLiteDatabase,
    tableName: string,
    columnName: string,
    definition: string,
) {
    const columns = await database.getAllAsync<{ name: string }>(`PRAGMA table_info(${tableName})`);
    if (columns.some((column) => column.name === columnName)) {
        return;
    }

    await database.execAsync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`);
}
