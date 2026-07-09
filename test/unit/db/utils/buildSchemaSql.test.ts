import { describe, expect, it } from "@jest/globals";

import { buildCreateSchemaStatements, buildDropSchemaStatements } from "@/db/utils/buildSchemaSql";

describe("Generación de SQL del esquema", () => {
    it("construye sentencias CREATE con índices y claves foráneas", () => {
        const statements = buildCreateSchemaStatements();

        expect(statements).toContainEqual(expect.stringContaining('CREATE TABLE IF NOT EXISTS "schema_migrations"'));
        expect(statements).toContainEqual(expect.stringContaining(") STRICT;"));
        expect(statements).toContainEqual(expect.stringContaining('CREATE TABLE IF NOT EXISTS "content_rules"'));
        expect(statements).toContainEqual(
            expect.stringContaining(
                'FOREIGN KEY ("content_item_id") REFERENCES "content_items" ("id") ON DELETE CASCADE',
            ),
        );
        expect(statements).toContainEqual(
            expect.stringContaining('CREATE INDEX IF NOT EXISTS "ix_content_rules_lookup" ON "content_rules"'),
        );
        expect(statements).toContainEqual(
            expect.stringContaining(
                'CREATE UNIQUE INDEX IF NOT EXISTS "uq_period_runs_start_active" ON "period_runs" ("user_id", "start_date") WHERE "deleted_at" IS NULL;',
            ),
        );
        expect(statements).toContainEqual(expect.stringContaining('PRIMARY KEY ("user_id", "local_date")'));
    });

    it("elimina tablas en orden inverso de dependencias", () => {
        const statements = buildDropSchemaStatements();

        expect(statements[0]).toBe('DROP TABLE IF EXISTS "content_delivery_log";');
        expect(statements.at(-1)).toBe('DROP TABLE IF EXISTS "schema_migrations";');
    });
});
