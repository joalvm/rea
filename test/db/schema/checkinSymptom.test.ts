import { describe, expect, it } from "vitest";

import { checkinSymptom } from "@/db/schema/checkinSymptom";
import { checkNames, columnNames, foreignKeys, indexNames, primaryKeyColumns } from "@test/db/utils/schemaMetadata";

describe("checkinSymptom schema", () => {
    it("defines table columns", () => {
        expect(columnNames(checkinSymptom)).toEqual([
            "checkin_id",
            "symptom_key",
            "intensity",
            "created_at",
            "updated_at",
            "deleted_at",
            "version",
        ]);
    });

    it("declares composite key, checks, indexes and foreign keys", () => {
        expect(primaryKeyColumns(checkinSymptom)).toEqual([["checkin_id", "symptom_key"]]);
        expect(indexNames(checkinSymptom)).toEqual(["ix_checkin_symptoms_lookup"]);
        expect(checkNames(checkinSymptom)).toEqual(["checkin_symptom_intensity_check"]);
        expect(foreignKeys(checkinSymptom)).toEqual([
            { columns: ["checkin_id"], foreignColumns: ["id"], foreignTable: "checkins", onDelete: "cascade" },
            {
                columns: ["symptom_key"],
                foreignColumns: ["symptom_key"],
                foreignTable: "symptom_catalog",
                onDelete: undefined,
            },
        ]);
    });
});
