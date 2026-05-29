import * as SQLite from "expo-sqlite";

let database: SQLite.SQLiteDatabase | null = null;

/** Abre y reutiliza conexión SQLite local de app. */
export default function db() {
    if (!database) {
        database = SQLite.openDatabaseSync("rea.db");
    }

    return database;
}
