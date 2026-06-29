import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import * as schema from "@/db/schema/schema";
import { buildCreateSchemaStatements } from "@/db/utils/buildSchemaSql";

/**
 * Variante de `createRealDatabase` apoyada en un **archivo temporal** (no
 * `:memory:`). El backend local de `@libsql/client` recicla la conexión tras una
 * transacción creando un `new Database(...)`: con `:memory:` eso borra el
 * esquema, pero con un archivo todas las conexiones ven el mismo contenido.
 *
 * Úsala en tests que ejerzan `db.transaction(...)`. Se limpia con `close()`.
 */
export async function createFileDatabase() {
    const dir = mkdtempSync(join(tmpdir(), "rea-test-"));
    const url = `file:${join(dir, "rea.db").replaceAll("\\", "/")}`;
    const client = createClient({ url });

    const createSchemaSql = ["PRAGMA foreign_keys = ON;", ...buildCreateSchemaStatements()].join("\n");
    await client.executeMultiple(createSchemaSql);

    const foreignKeys = await client.execute("PRAGMA foreign_keys;");
    const foreignKeysEnabled = Number(foreignKeys.rows[0]?.foreign_keys ?? 0);

    if (foreignKeysEnabled !== 1) {
        client.close();
        throw new Error("El cliente de prueba con base de datos en archivo inició sin forzar claves foráneas");
    }

    return {
        client,
        db: drizzle(client, { schema }),
        close() {
            client.close();
            // En Windows el handle del archivo puede tardar un instante en liberarse;
            // la limpieza del tmp es best-effort (el SO purga su tmp).
            try {
                rmSync(dir, { recursive: true, force: true });
            } catch {
                /* noop */
            }
        },
    };
}

export type FileDatabase = Awaited<ReturnType<typeof createFileDatabase>>;
