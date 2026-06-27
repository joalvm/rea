import { describe, expect, it } from "@jest/globals";

import { medicationCatalog } from "@/db/schema/medicationCatalog";
import { checkNames, columnNames, foreignKeys, indexNames } from "@test/db/utils/schemaMetadata";

describe("medicationCatalog schema", () => {
    it("defines table columns", () => {
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

    it("declares checks, active-name index and profile foreign key", () => {
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
