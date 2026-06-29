import { describe, expect, it } from "@jest/globals";

import { schemaMigration } from "@/db/schema/schemaMigration";
import { columnNames, tableName } from "@test/db/utils/schemaMetadata";

describe("Esquema de la tabla de migraciones", () => {
    it("define la tabla de sello de migración", () => {
        expect(tableName(schemaMigration)).toBe("schema_migrations");
        expect(columnNames(schemaMigration)).toEqual(["version", "name", "applied_at"]);
    });
});
