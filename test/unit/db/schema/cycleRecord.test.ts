import { describe, expect, it } from "@jest/globals";

import { cycleRecord } from "@/db/schema/cycleRecord";
import { checkNames, columnNames, foreignKeys, tableName, uniqueConstraints } from "@test/db/utils/schemaMetadata";

describe("Esquema de cycleRecord", () => {
    it("define el contrato de la tabla cycle_records", () => {
        expect(tableName(cycleRecord)).toBe("cycle_records");
        expect(columnNames(cycleRecord)).toEqual([
            "id",
            "user_id",
            "start_date",
            "end_date",
            "cycle_length",
            "period_length",
            "ovulation_date",
            "ovulation_basis",
            "luteal_length",
            "predicted_start",
            "prediction_error_days",
            "is_valid",
            "excluded_reason",
            "created_at",
            "updated_at",
            "version",
        ]);
    });

    it("conserva valores por defecto, restricción única, CHECKs y clave foránea", () => {
        expect(cycleRecord.isValid.default).toBe(true);
        expect(cycleRecord.version.default).toBe(1);
        expect(cycleRecord.ovulationBasis.enumValues).toEqual(["bbt", "opk", "mucus", "calendar"]);
        expect(uniqueConstraints(cycleRecord)).toEqual([
            { name: "uq_cycle_records_user_start_date", columns: ["user_id", "start_date"] },
        ]);
        expect(checkNames(cycleRecord)).toEqual([
            "cycle_record_start_date_format_check",
            "cycle_record_end_date_format_check",
            "cycle_record_date_range_check",
            "cycle_record_cycle_length_check",
            "cycle_record_ovulation_basis_check",
            "cycle_record_period_length_check",
            "cycle_record_ovulation_date_format_check",
            "cycle_record_ovulation_date_range_check",
            "cycle_record_luteal_length_check",
            "cycle_record_predicted_start_format_check",
            "cycle_record_is_valid_check",
        ]);
        expect(foreignKeys(cycleRecord)).toEqual([
            { columns: ["user_id"], foreignColumns: ["id"], foreignTable: "user_profile", onDelete: "cascade" },
        ]);
    });
});
