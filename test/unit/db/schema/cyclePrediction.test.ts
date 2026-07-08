import { describe, expect, it } from "@jest/globals";

import { cyclePrediction } from "@/db/schema/cyclePrediction";
import { checkNames, columnNames, foreignKeys, primaryKeyColumns, tableName } from "@test/db/utils/schemaMetadata";

describe("Esquema de cyclePrediction", () => {
    it("define el contrato de la tabla cycle_predictions", () => {
        expect(tableName(cyclePrediction)).toBe("cycle_predictions");
        expect(columnNames(cyclePrediction)).toEqual([
            "user_id",
            "calculation_date",
            "predicted_next_start",
            "predicted_ovulation",
            "predicted_fertile_start",
            "predicted_fertile_end",
            "predicted_period_length",
            "cycle_length_used",
            "luteal_phase_used",
            "confidence",
        ]);
        expect(primaryKeyColumns(cyclePrediction)).toEqual([["user_id", "calculation_date"]]);
    });

    it("conserva valores por defecto, restricciones CHECK y clave foránea", () => {
        expect(cyclePrediction.lutealPhaseUsed.default).toBe(14);
        expect(cyclePrediction.confidence.enumValues).toEqual(["low", "medium", "high"]);
        expect(checkNames(cyclePrediction)).toEqual([
            "cycle_predictions_confidence_check",
            "cycle_predictions_fertile_start_format_check",
            "cycle_predictions_fertile_end_format_check",
            "cycle_predictions_fertile_window_pairing_check",
            "cycle_predictions_period_length_check",
        ]);
        expect(foreignKeys(cyclePrediction)).toEqual([
            { columns: ["user_id"], foreignColumns: ["id"], foreignTable: "user_profile", onDelete: "cascade" },
        ]);
    });
});
