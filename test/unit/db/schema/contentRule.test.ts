import { describe, expect, it } from "@jest/globals";

import { contentRule } from "@/db/schema/contentRule";
import { checkNames, columnNames, foreignKeys, indexNames } from "@test/db/utils/schemaMetadata";

describe("contentRule schema", () => {
    it("defines table columns", () => {
        expect(columnNames(contentRule)).toEqual([
            "id",
            "content_item_id",
            "trigger_type",
            "trigger_key",
            "min_value",
            "max_value",
            "required_value",
            "priority",
            "created_at",
            "updated_at",
        ]);
    });

    it("keeps defaults, checks, index and content item foreign key", () => {
        expect(contentRule.priority.default).toBe(100);
        expect(contentRule.triggerType.enumValues).toEqual([
            "phase",
            "symptom",
            "metric_threshold",
            "reproductive_intent",
            "contraception",
            "pregnancy_week",
            "general",
        ]);
        expect(indexNames(contentRule)).toEqual(["ix_content_rules_lookup"]);
        expect(checkNames(contentRule)).toEqual(["content_rule_trigger_type_check"]);
        expect(foreignKeys(contentRule)).toEqual([
            {
                columns: ["content_item_id"],
                foreignColumns: ["id"],
                foreignTable: "content_items",
                onDelete: "cascade",
            },
        ]);
    });
});
