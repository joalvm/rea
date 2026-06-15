import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "@/db/schema/schema";
import { buildCreateSchemaStatements } from "@/db/utils/buildSchemaSql";

const createSchemaSql = ["PRAGMA foreign_keys = ON;", ...buildCreateSchemaStatements()].join("\n");

export async function createRealDatabase() {
    const client = createClient({ url: ":memory:" });

    await client.executeMultiple(createSchemaSql);

    const foreignKeys = await client.execute("PRAGMA foreign_keys;");
    const foreignKeysEnabled = Number(foreignKeys.rows[0]?.foreign_keys ?? 0);

    if (foreignKeysEnabled !== 1) {
        client.close();
        throw new Error("SQLite test client started without foreign key enforcement");
    }

    return {
        client,
        db: drizzle(client, { schema }),
        close() {
            client.close();
        },
    };
}

export type RealDatabase = Awaited<ReturnType<typeof createRealDatabase>>;
