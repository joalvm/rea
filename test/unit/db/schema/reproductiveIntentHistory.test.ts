import { describe, expect, it } from "@jest/globals";

import { reproductiveIntentHistory } from "@/db/schema/reproductiveIntentHistory";
import { checkNames, columnNames, foreignKeys, indexNames } from "@test/db/utils/schemaMetadata";

describe("reproductiveIntentHistory schema", () => {
    it("defines table columns", () => {
        expect(columnNames(reproductiveIntentHistory)).toEqual([
            "id",
            "user_id",
            "effective_from",
            "effective_to",
            "current_mode",
            "cycle_intent",
            "regularity",
            "hormonal_contraception",
            "declared_cycle_length",
            "declared_period_length",
            "created_at",
            "updated_at",
            "deleted_at",
            "version",
        ]);
    });

    it("declares checks, indexes and profile foreign key", () => {
        expect(indexNames(reproductiveIntentHistory)).toEqual(["uq_reproductive_intent_single_open"]);
        expect(checkNames(reproductiveIntentHistory)).toEqual([
            "reproductive_intent_current_mode_check",
            "cycle_intent_check",
            "cycle_intent_mode_consistency_check",
            "regularity_check",
            "hormonal_contraception_check",
            "ttc_hormonal_contraception_exclusion_check",
            "declared_cycle_length_check",
            "declared_period_length_check",
            "effective_from_format_check",
            "effective_to_format_check",
            "effective_range_check",
        ]);
        expect(foreignKeys(reproductiveIntentHistory)).toEqual([
            { columns: ["user_id"], foreignColumns: ["id"], foreignTable: "user_profile", onDelete: "cascade" },
        ]);
    });
});
