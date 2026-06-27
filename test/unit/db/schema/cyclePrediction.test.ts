import { describe, expect, it } from "@jest/globals";

import { cyclePrediction } from "@/db/schema/cyclePrediction";
import { checkNames, columnNames, foreignKeys, primaryKeyColumns, tableName } from "@test/db/utils/schemaMetadata";

describe("cyclePrediction schema", () => {
    it("defines the cycle_predictions table contract", () => {
        expect(tableName(cyclePrediction)).toBe("cycle_predictions");
        expect(columnNames(cyclePrediction)).toEqual([
            "user_id",
            "calculation_date",
            "predicted_next_start",
            "predicted_ovulation",
            "cycle_length_used",
            "luteal_phase_used",
            "confidence",
        ]);
        expect(primaryKeyColumns(cyclePrediction)).toEqual([["user_id", "calculation_date"]]);
    });

    it("keeps defaults, checks and foreign key", () => {
        expect(cyclePrediction.lutealPhaseUsed.default).toBe(14);
        expect(cyclePrediction.confidence.enumValues).toEqual(["low", "medium", "high"]);
        expect(checkNames(cyclePrediction)).toEqual(["cycle_predictions_confidence_check"]);
        expect(foreignKeys(cyclePrediction)).toEqual([
            { columns: ["user_id"], foreignColumns: ["id"], foreignTable: "user_profile", onDelete: "cascade" },
        ]);
    });
});
