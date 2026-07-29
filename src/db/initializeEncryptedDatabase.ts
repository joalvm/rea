import type { SQLiteDatabase } from "expo-sqlite";

import { getOrCreateDatabaseKey } from "@/domain/privacy/deviceKey";

import { initializeDatabase } from "./initializeDatabase";

/** Inicializa SQLCipher antes de WAL, foreign keys y el esquema versionado. */
export async function initializeEncryptedDatabase(database: SQLiteDatabase) {
    const key = await getOrCreateDatabaseKey();
    const escapedKey = key.replaceAll("'", "''");
    await database.execAsync(`PRAGMA key = '${escapedKey}';`);
    await initializeDatabase(database);
}
