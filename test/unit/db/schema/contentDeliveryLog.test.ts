import { describe, expect, it } from "@jest/globals";

import { contentDeliveryLog } from "@/db/schema/contentDeliveryLog";
import { checkNames, columnNames, foreignKeys, indexNames } from "@test/db/utils/schemaMetadata";

describe("contentDeliveryLog schema", () => {
    it("defines table columns", () => {
        expect(columnNames(contentDeliveryLog)).toEqual([
            "id",
            "user_id",
            "content_item_id",
            "surface",
            "shown_at",
            "dismissed_at",
        ]);
    });

    it("declares surface checks, index and foreign keys", () => {
        expect(contentDeliveryLog.surface.enumValues).toEqual(["today", "day_detail", "statistics"]);
        expect(indexNames(contentDeliveryLog)).toEqual(["ix_content_delivery_user_recent"]);
        expect(checkNames(contentDeliveryLog)).toEqual(["content_delivery_surface_check"]);
        expect(foreignKeys(contentDeliveryLog)).toEqual([
            { columns: ["user_id"], foreignColumns: ["id"], foreignTable: "user_profile", onDelete: "cascade" },
            {
                columns: ["content_item_id"],
                foreignColumns: ["id"],
                foreignTable: "content_items",
                onDelete: "cascade",
            },
        ]);
    });
});
