import { describe, expect, it } from "@jest/globals";

import { checkin } from "@/db/schema/checkin";
import { checkNames, columnNames, foreignKeys, indexNames } from "@test/db/utils/schemaMetadata";

describe("Esquema de checkin", () => {
    it("define las columnas de la tabla", () => {
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
            "pain_intensity",
            "pain_interference",
            "pms_intensity",
            "period_status_signal",
            "cervical_position",
            "basal_body_temp_c",
            "opk_result",
            "pregnancy_test_result",
            "morning_sickness",
            "fetal_movement",
            "note",
            "excluded_from_summary",
            "created_at",
            "updated_at",
            "deleted_at",
            "version",
        ]);
    });

    it("declara restricciones CHECK, índices y la clave foránea a profile", () => {
        expect(indexNames(checkin)).toEqual(["ix_checkins_date_search", "ix_checkins_chronological"]);
        expect(checkNames(checkin)).toContain("checkin_cervical_mucus_check");
        expect(checkNames(checkin)).toContain("checkin_period_status_signal_check");
        expect(checkNames(checkin)).toContain("checkin_cervical_position_check");
        expect(checkNames(checkin)).toContain("checkin_basal_body_temp_c_check");
        expect(checkNames(checkin)).toContain("checkin_opk_result_check");
        expect(checkNames(checkin)).toContain("checkin_pregnancy_test_result_check");
        expect(checkNames(checkin)).toContain("checkin_morning_sickness_check");
        expect(checkNames(checkin)).toContain("checkin_fetal_movement_check");
        expect(checkNames(checkin)).toContain("checkin_excluded_from_summary_check");
        expect(checkNames(checkin)).toContain("checkin_local_date_format_check");
        expect(foreignKeys(checkin)).toEqual([
            { columns: ["user_id"], foreignColumns: ["id"], foreignTable: "user_profile", onDelete: "cascade" },
        ]);
    });
});
