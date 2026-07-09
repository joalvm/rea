import { describe, expect, it } from "@jest/globals";

import { contentItem } from "@/db/schema/contentItem";
import { checkNames, columnNames, foreignKeys, indexNames } from "@test/db/utils/schemaMetadata";

describe("Esquema de contentItem", () => {
    it("define las columnas de la tabla", () => {
        expect(columnNames(contentItem)).toEqual([
            "id",
            "content_type",
            "topic",
            "title_key",
            "body_key",
            "min_confidence",
            "target_mode",
            "priority",
            "locale",
            "source_id",
            "content_version",
            "is_active",
            "valid_from",
            "valid_until",
            "reviewed_at",
            "created_at",
            "updated_at",
        ]);
    });

    it("conserva valores por defecto, restricciones CHECK, índice y la clave foránea a contentSource", () => {
        expect(contentItem.priority.default).toBe(100);
        expect(contentItem.locale.default).toBe("es");
        expect(contentItem.isActive.default).toBe(true);
        expect(indexNames(contentItem)).toEqual(["ix_content_items_active_priority"]);
        expect(checkNames(contentItem)).toEqual([
            "content_item_type_check",
            "content_item_min_confidence_check",
            "content_item_target_mode_check",
            "content_item_active_check",
            "content_item_valid_range_check",
        ]);
        expect(foreignKeys(contentItem)).toEqual([
            { columns: ["source_id"], foreignColumns: ["id"], foreignTable: "content_sources", onDelete: undefined },
        ]);
    });
});
