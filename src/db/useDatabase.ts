import { drizzle } from "drizzle-orm/expo-sqlite";
import { useMemo } from "react";
import { useSQLiteContext } from "expo-sqlite";

import type { Database } from "./client";
import * as schema from "./schema/schema";

/**
 * Devuelve una instancia Drizzle (memoizada por conexión) a partir del contexto
 * de `SQLiteProvider`. Úsalo para lecturas/escrituras tipadas con el esquema.
 */
export function useDatabase(): Database {
    const connection = useSQLiteContext();
    return useMemo(() => drizzle(connection, { schema }), [connection]);
}
