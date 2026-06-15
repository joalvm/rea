import { drizzle } from "drizzle-orm/expo-sqlite";

import * as schema from "./schema/schema";
import { conn } from "./connection";

export const db = drizzle(conn, { schema });

export type Database = typeof db;
export type DatabaseSchema = typeof schema;
