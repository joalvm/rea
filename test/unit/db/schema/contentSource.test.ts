import { describe, expect, it } from "@jest/globals";

import { contentSource } from "@/db/schema/contentSource";
import { checkNames, columnNames } from "@test/db/utils/schemaMetadata";

describe("contentSource schema", () => {
    it("defines table columns and source type checks", () => {
        expect(columnNames(contentSource)).toEqual([
            "id",
            "label_key",
            "reference_key",
            "source_url",
            "source_type",
            "reviewed_at",
            "created_at",
            "updated_at",
        ]);
        expect(contentSource.sourceType.enumValues).toEqual([
            "medical_guideline",
            "government_health",
            "peer_reviewed",
            "clinical_education",
            "book",
            "other",
        ]);
        expect(checkNames(contentSource)).toEqual(["content_source_type_check"]);
    });
});
