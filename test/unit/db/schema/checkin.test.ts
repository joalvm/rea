import { describe, expect, it } from "@jest/globals";

import { checkin } from "@/db/schema/checkin";
import { checkNames, columnNames, foreignKeys, indexNames } from "@test/db/utils/schemaMetadata";

describe("checkin schema", () => {
    it("defines table columns", () => {
        expect(columnNames(checkin)).toEqual([
            "id",
            "user_id",
            "recorded_at",
            "local_date",
            "bleeding_intensity",
            "clots",
            "cervical_mucus",
            "mood",
            "energy",
            "stress_level",
            "breast_sensitivity",
            "libido",
            "pain_intensity",
            "pain_interference",
            "pms_intensity",
            "period_status_signal",
            "note",
            "created_at",
            "updated_at",
            "deleted_at",
            "version",
        ]);
    });

    it("declares checks, indexes and profile foreign key", () => {
        expect(indexNames(checkin)).toEqual(["ix_checkins_date_search", "ix_checkins_chronological"]);
        expect(checkNames(checkin)).toContain("checkin_cervical_mucus_check");
        expect(checkNames(checkin)).toContain("checkin_period_status_signal_check");
        expect(checkNames(checkin)).toContain("checkin_local_date_format_check");
        expect(foreignKeys(checkin)).toEqual([
            { columns: ["user_id"], foreignColumns: ["id"], foreignTable: "user_profile", onDelete: "cascade" },
        ]);
    });
});
