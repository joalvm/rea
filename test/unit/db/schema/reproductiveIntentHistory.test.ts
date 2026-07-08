import { describe, expect, it } from "@jest/globals";

import { reproductiveIntentHistory } from "@/db/schema/reproductiveIntentHistory";
import { checkNames, columnNames, foreignKeys, indexNames } from "@test/db/utils/schemaMetadata";

describe("Esquema de reproductiveIntentHistory", () => {
    it("define las columnas de la tabla", () => {
        expect(columnNames(reproductiveIntentHistory)).toEqual([
            "id",
            "user_id",
            "effective_from",
            "effective_to",
            "reproductive_mode",
            "regularity",
            "contraception_method",
            "declared_cycle_length",
            "declared_period_length",
            "breastfeeding",
            "created_at",
            "updated_at",
            "deleted_at",
            "version",
        ]);
    });

    it("declara restricciones CHECK, índices y la clave foránea a profile", () => {
        expect(indexNames(reproductiveIntentHistory)).toEqual(["uq_reproductive_intent_single_open"]);
        expect(checkNames(reproductiveIntentHistory)).toEqual([
            "reproductive_mode_check",
            "regularity_check",
            "contraception_method_check",
            "ttc_hormonal_contraception_exclusion_check",
            "declared_cycle_length_check",
            "declared_period_length_check",
            "cycle_fields_pregnancy_nullability_check",
            "breastfeeding_check",
            "breastfeeding_pregnancy_exclusion_check",
            "effective_from_format_check",
            "effective_to_format_check",
            "effective_range_check",
        ]);
        expect(foreignKeys(reproductiveIntentHistory)).toEqual([
            { columns: ["user_id"], foreignColumns: ["id"], foreignTable: "user_profile", onDelete: "cascade" },
        ]);
    });
});
