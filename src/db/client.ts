import { drizzle } from "drizzle-orm/expo-sqlite";
import type { SQLiteDatabase } from "expo-sqlite";

import * as schema from "./schema/schema";
import { conn } from "./connection";

export function createDatabase(connection: SQLiteDatabase) {
    return drizzle(connection, { schema });
}

export const db = createDatabase(conn);

export type Database = typeof db;
export type DatabaseSchema = typeof schema;
