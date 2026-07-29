import { describe, expect, it } from "@jest/globals";

import { selectContentCandidates } from "@/domain/content/selectContentCandidates";
import type { ContentItem } from "@/db/schema/contentItem";
import type { ContentRule } from "@/db/schema/contentRule";

const item = (id: string): ContentItem => ({
    id,
    contentType: "educational",
    topic: "pregnancy_week",
    titleKey: "content:title",
    bodyKey: "content:body",
    minConfidence: null,
    targetMode: "pregnancy_tracking",
    priority: 10,
    locale: "es",
    sourceId: "source",
    contentVersion: "1",
    isActive: true,
    validFrom: null,
    validUntil: null,
    reviewedAt: null,
    createdAt: "2026-07-29T00:00:00Z",
    updatedAt: "2026-07-29T00:00:00Z",
});

const rule = (id: string, itemId: string, minValue: number, maxValue: number): ContentRule => ({
    id,
    contentItemId: itemId,
    triggerType: "pregnancy_week",
    triggerKey: "week",
    minValue,
    maxValue,
    requiredValue: null,
    priority: 10,
    createdAt: "2026-07-29T00:00:00Z",
    updatedAt: "2026-07-29T00:00:00Z",
});

describe("selectContentCandidates", () => {
    it("aplica todas las reglas y no muestra embarazo fuera del rango", () => {
        const selected = selectContentCandidates([item("week-21")], [rule("rule-21", "week-21", 21, 24)], {
            pregnancyWeek: 22,
            reproductiveMode: "pregnancy_tracking",
        });
        const empty = selectContentCandidates([item("week-21")], [rule("rule-21", "week-21", 21, 24)], {
            pregnancyWeek: 25,
            reproductiveMode: "pregnancy_tracking",
        });

        expect(selected.map((candidate) => candidate.id)).toEqual(["week-21"]);
        expect(empty).toHaveLength(0);
    });
});
