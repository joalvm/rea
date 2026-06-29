import { describe, expect, it } from "@jest/globals";

import { medicationCatalog } from "@/db/schema/medicationCatalog";
import { checkNames, columnNames, foreignKeys, indexNames } from "@test/db/utils/schemaMetadata";

describe("Esquema de medicationCatalog", () => {
    it("define las columnas de la tabla", () => {
        expect(columnNames(medicationCatalog)).toEqual([
            "id",
            "user_id",
            "name",
            "normalized_name",
            "is_pregnancy_safe",
            "created_at",
            "updated_at",
            "deleted_at",
            "version",
        ]);
    });

    it("declara restricciones CHECK, el índice de nombre activo y la clave foránea a profile", () => {
        expect(medicationCatalog.version.default).toBe(1);
        expect(indexNames(medicationCatalog)).toEqual(["uq_medication_catalog_active_name"]);
        expect(checkNames(medicationCatalog)).toEqual([
            "medication_name_not_empty_check",
            "medication_is_pregnancy_safe_check",
        ]);
        expect(foreignKeys(medicationCatalog)).toEqual([
            { columns: ["user_id"], foreignColumns: ["id"], foreignTable: "user_profile", onDelete: "cascade" },
        ]);
    });
});
