import { describe, expect, it } from "@jest/globals";

import { periodRun } from "@/db/schema/periodRun";
import { checkNames, columnNames, foreignKeys, indexNames } from "@test/db/utils/schemaMetadata";

describe("periodRun schema", () => {
    it("defines table columns", () => {
        expect(columnNames(periodRun)).toEqual([
            "id",
            "user_id",
            "start_date",
            "end_date",
            "status",
            "source",
            "created_at",
            "updated_at",
            "deleted_at",
            "version",
        ]);
    });

    it("keeps defaults, checks, indexes and profile foreign key", () => {
        expect(periodRun.status.default).toBe("open");
        expect(periodRun.source.default).toBe("user_confirmed");
        expect(periodRun.status.enumValues).toEqual(["open", "closed", "excluded"]);
        expect(indexNames(periodRun)).toEqual(["uq_period_runs_start_active", "uq_period_runs_single_open"]);
        expect(checkNames(periodRun)).toEqual([
            "period_run_status_check",
            "period_run_source_check",
            "period_run_start_date_format_check",
            "period_run_end_date_format_check",
            "period_run_date_range_check",
        ]);
        expect(foreignKeys(periodRun)).toEqual([
            { columns: ["user_id"], foreignColumns: ["id"], foreignTable: "user_profile", onDelete: "cascade" },
        ]);
    });
});
