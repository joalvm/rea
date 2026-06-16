import { describe, expect, it } from "@jest/globals";

import { intercourseLog } from "@/db/schema/intercourseLog";
import { checkNames, columnNames, foreignKeys, indexNames } from "@test/db/utils/schemaMetadata";

describe("intercourseLog schema", () => {
    it("defines table columns", () => {
        expect(columnNames(intercourseLog)).toEqual([
            "id",
            "user_id",
            "occurred_at",
            "local_date",
            "protected",
            "created_at",
            "updated_at",
            "deleted_at",
            "version",
        ]);
    });

    it("keeps defaults, checks, index and profile foreign key", () => {
        expect(intercourseLog.version.default).toBe(1);
        expect(indexNames(intercourseLog)).toEqual(["ix_intercourse_log_date"]);
        expect(checkNames(intercourseLog)).toEqual(["intercourse_local_date_check", "intercourse_protected_check"]);
        expect(foreignKeys(intercourseLog)).toEqual([
            { columns: ["user_id"], foreignColumns: ["id"], foreignTable: "user_profile", onDelete: "cascade" },
        ]);
    });
});
