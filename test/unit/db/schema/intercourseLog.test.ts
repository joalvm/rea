import { describe, expect, it } from "@jest/globals";

import { intercourseLog } from "@/db/schema/intercourseLog";
import { checkNames, columnNames, foreignKeys, indexNames } from "@test/db/utils/schemaMetadata";

describe("Esquema de intercourseLog", () => {
    it("define las columnas de la tabla", () => {
        expect(columnNames(intercourseLog)).toEqual([
            "id",
            "user_id",
            "occurred_at",
            "local_date",
            "protected",
            "in_fertile_window",
            "created_at",
            "updated_at",
            "deleted_at",
            "version",
        ]);
    });

    it("conserva valores por defecto, restricciones CHECK, índice y la clave foránea a profile", () => {
        expect(intercourseLog.version.default).toBe(1);
        expect(indexNames(intercourseLog)).toEqual(["ix_intercourse_log_date"]);
        expect(checkNames(intercourseLog)).toEqual([
            "intercourse_local_date_check",
            "intercourse_protected_check",
            "intercourse_in_fertile_window_check",
        ]);
        expect(foreignKeys(intercourseLog)).toEqual([
            { columns: ["user_id"], foreignColumns: ["id"], foreignTable: "user_profile", onDelete: "cascade" },
        ]);
    });
});
