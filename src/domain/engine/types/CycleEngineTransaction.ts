import type { Database } from "@/db/client";

/** Tipo de la transacción que recibe el callback de `database.transaction(...)`. */
export type CycleEngineTransaction = Parameters<Database["transaction"]>[0] extends (tx: infer Transaction) => unknown
    ? Transaction
    : never;
