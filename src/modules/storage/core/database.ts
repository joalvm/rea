import * as SQLite from "expo-sqlite";

/** Nombre estable del archivo SQLite principal de la app. */
export const DATABASE_NAME = "rea.db";

let database: SQLite.SQLiteDatabase | null = null;

/** Abre y reutiliza conexión SQLite local de app. */
export default function db() {
    if (!database) {
        database = SQLite.openDatabaseSync(DATABASE_NAME);
    }

    return database;
}

/** Cierra la conexión cacheada cuando un flujo necesita recrearla limpiamente. */
export async function closeDatabaseConnection() {
    if (!database) {
        return;
    }

    await database.closeAsync();
    database = null;
}
