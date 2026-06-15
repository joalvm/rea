import { drizzle } from "drizzle-orm/expo-sqlite";

import * as schema from "./schema/schema";
import { openDatabaseSync } from "expo-sqlite";

export const DATABASE_NAME = "rea.db";

export const conn = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });

export const db = drizzle(conn, { schema });

export type Database = typeof db;
export type DatabaseSchema = typeof schema;
