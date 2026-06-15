import { describe, expect, it } from "@jest/globals";

import { symptomCatalog } from "@/db/schema/symptomCatalog";
import { checkNames, columnNames } from "@test/db/utils/schemaMetadata";

describe("symptomCatalog schema", () => {
    it("defines table columns", () => {
        expect(columnNames(symptomCatalog)).toEqual([
            "symptom_key",
            "group_key",
            "label_key",
            "ui_priority",
            "is_quick_option",
            "is_active",
            "created_at",
            "updated_at",
        ]);
    });

    it("keeps defaults, enum values and checks", () => {
        expect(symptomCatalog.uiPriority.default).toBe(100);
        expect(symptomCatalog.isQuickOption.default).toBe(false);
        expect(symptomCatalog.isActive.default).toBe(true);
        expect(symptomCatalog.groupKey.enumValues).toEqual([
            "pain",
            "digestive",
            "skin",
            "sleep",
            "mood",
            "energy",
            "bleeding",
            "body",
            "sexual_health",
            "other",
        ]);
        expect(checkNames(symptomCatalog)).toEqual([
            "symptom_group_key_check",
            "symptom_quick_option_check",
            "symptom_active_check",
        ]);
    });
});
