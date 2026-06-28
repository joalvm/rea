import { drizzle } from "drizzle-orm/expo-sqlite";
import type { SQLiteDatabase } from "expo-sqlite";

import * as schema from "./schema/schema";

export function createDatabase(connection: SQLiteDatabase) {
    return drizzle(connection, { schema });
}

export type Database = ReturnType<typeof createDatabase>;
export type DatabaseSchema = typeof schema;
