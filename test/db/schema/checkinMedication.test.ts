import { describe, expect, it } from "vitest";

import { checkinMedication } from "@/db/schema/checkinMedication";
import { checkNames, columnNames, foreignKeys, indexNames } from "@test/db/utils/schemaMetadata";

describe("checkinMedication schema", () => {
    it("defines table columns", () => {
        expect(columnNames(checkinMedication)).toEqual([
            "id",
            "checkin_id",
            "medication_id",
            "taken_at",
            "relief",
            "dose_note",
            "created_at",
            "updated_at",
            "deleted_at",
            "version",
        ]);
    });

    it("declares checks, indexes and foreign keys", () => {
        expect(indexNames(checkinMedication)).toEqual(["ix_checkin_medications_lookup"]);
        expect(checkNames(checkinMedication)).toEqual(["checkin_medication_relief_check"]);
        expect(foreignKeys(checkinMedication)).toEqual([
            { columns: ["checkin_id"], foreignColumns: ["id"], foreignTable: "checkins", onDelete: "cascade" },
            {
                columns: ["medication_id"],
                foreignColumns: ["id"],
                foreignTable: "medication_catalog",
                onDelete: undefined,
            },
        ]);
    });
});
