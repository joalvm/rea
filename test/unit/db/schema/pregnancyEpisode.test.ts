import { describe, expect, it } from "@jest/globals";

import { pregnancyEpisode } from "@/db/schema/pregnancyEpisode";
import { checkNames, columnNames, foreignKeys, indexNames } from "@test/db/utils/schemaMetadata";

describe("Esquema de pregnancyEpisode", () => {
    it("define las columnas de la tabla", () => {
        expect(columnNames(pregnancyEpisode)).toEqual([
            "id",
            "user_id",
            "lmp_date",
            "due_date",
            "dating_basis",
            "end_date",
            "outcome",
            "outcome_details",
            "created_at",
            "updated_at",
            "deleted_at",
            "version",
        ]);
    });

    it("conserva valores por defecto, restricciones CHECK, índices y la clave foránea a profile", () => {
        expect(pregnancyEpisode.version.default).toBe(1);
        expect(indexNames(pregnancyEpisode)).toEqual(["uq_pregnancy_single_ongoing"]);
        expect(checkNames(pregnancyEpisode)).toEqual([
            "pregnancy_dating_basis_check",
            "pregnancy_outcome_check",
            "pregnancy_lmp_date_check",
            "pregnancy_end_date_check",
            "pregnancy_date_range_check",
            "pregnancy_open_outcome_check",
        ]);
        expect(foreignKeys(pregnancyEpisode)).toEqual([
            { columns: ["user_id"], foreignColumns: ["id"], foreignTable: "user_profile", onDelete: "cascade" },
        ]);
    });
});
