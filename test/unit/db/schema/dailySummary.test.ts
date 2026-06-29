import { describe, expect, it } from "@jest/globals";

import { dailySummary } from "@/db/schema/dailySummary";
import { checkNames, columnNames, foreignKeys, indexNames, primaryKeyColumns } from "@test/db/utils/schemaMetadata";

describe("Esquema de dailySummary", () => {
    it("define las columnas de la tabla", () => {
        expect(columnNames(dailySummary)).toEqual([
            "local_date",
            "user_id",
            "is_menstruation_day",
            "menstruation_basis",
            "is_spotting_day",
            "is_fertile_day",
            "ovulation_confirmed",
            "is_pregnancy_day",
            "pregnancy_week",
            "pregnancy_trimester",
            "had_medication",
            "had_intercourse",
            "avg_mood",
            "avg_energy",
            "avg_stress",
            "max_pain",
            "max_symptom_intensity",
            "top_symptom_key",
            "medication_relief_score",
            "estimated_phase",
            "phase_source",
            "phase_confidence",
            "updated_at",
        ]);
    });

    it("conserva valores por defecto, clave compuesta, restricciones CHECK, índice y claves foráneas", () => {
        expect(dailySummary.hadIntercourse.default).toBe(false);
        expect(dailySummary.estimatedPhase.default).toBe("unknown");
        expect(dailySummary.phaseConfidence.default).toBe("low");
        expect(primaryKeyColumns(dailySummary)).toEqual([["user_id", "local_date"]]);
        expect(indexNames(dailySummary)).toEqual(["ix_daily_summary_phase"]);
        expect(checkNames(dailySummary)).toContain("daily_summary_fertile_day_check");
        expect(checkNames(dailySummary)).toContain("daily_summary_ovulation_confirmed_check");
        expect(checkNames(dailySummary)).toContain("daily_summary_pregnancy_day_check");
        expect(checkNames(dailySummary)).toContain("daily_summary_pregnancy_trimester_check");
        expect(checkNames(dailySummary)).toContain("daily_summary_had_intercourse_check");
        expect(checkNames(dailySummary)).toContain("daily_summary_estimated_phase_check");
        expect(checkNames(dailySummary)).toContain("daily_summary_phase_confidence_check");
        expect(foreignKeys(dailySummary)).toEqual([
            { columns: ["user_id"], foreignColumns: ["id"], foreignTable: "user_profile", onDelete: "cascade" },
            {
                columns: ["top_symptom_key"],
                foreignColumns: ["symptom_key"],
                foreignTable: "symptom_catalog",
                onDelete: undefined,
            },
        ]);
    });
});
