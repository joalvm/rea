import { describe, expect, it } from "@jest/globals";

import { pregnancyEpisode } from "@/db/schema/pregnancyEpisode";
import { checkNames, columnNames, foreignKeys, indexNames } from "@test/db/utils/schemaMetadata";

describe("pregnancyEpisode schema", () => {
    it("defines table columns", () => {
        expect(columnNames(pregnancyEpisode)).toEqual([
            "id",
            "user_id",
            "start_date",
            "end_date",
            "outcome",
            "note",
            "created_at",
            "updated_at",
            "deleted_at",
            "version",
        ]);
    });

    it("keeps defaults, checks, indexes and profile foreign key", () => {
        expect(pregnancyEpisode.version.default).toBe(1);
        expect(indexNames(pregnancyEpisode)).toEqual(["ix_pregnancy_chronological", "uq_pregnancy_single_ongoing"]);
        expect(checkNames(pregnancyEpisode)).toEqual([
            "pregnancy_outcome_check",
            "pregnancy_start_date_check",
            "pregnancy_end_date_check",
            "pregnancy_date_range_check",
            "pregnancy_open_outcome_check",
        ]);
        expect(foreignKeys(pregnancyEpisode)).toEqual([
            { columns: ["user_id"], foreignColumns: ["id"], foreignTable: "user_profile", onDelete: "cascade" },
        ]);
    });
});
