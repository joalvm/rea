import { describe, expect, it } from "@jest/globals";

import type { CheckinListItem } from "@/features/diary/diary/services/listCheckins";
import { groupByDay } from "@/features/diary/diary/utils/groupByDay";

function makeItem(id: string, localDate: string, recordedAt: string): CheckinListItem {
    return {
        id,
        recordedAt,
        localDate,
        bleedingIntensity: null,
        periodStatusSignal: null,
        note: null,
        excludedFromSummary: 0,
    };
}

describe("groupByDay", () => {
    it("devuelve [] para un array vacío", () => {
        expect(groupByDay([])).toEqual([]);
    });

    it("agrupa items de días distintos en grupos separados, orden desc", () => {
        const items = [
            makeItem("a", "2026-07-12", "2026-07-12T18:00:00Z"),
            makeItem("b", "2026-07-10", "2026-07-10T10:00:00Z"),
        ];

        const groups = groupByDay(items);

        expect(groups).toHaveLength(2);
        expect(groups[0]?.localDate).toBe("2026-07-12");
        expect(groups[1]?.localDate).toBe("2026-07-10");
    });

    it("agrupa items del mismo día en un único grupo", () => {
        const items = [
            makeItem("a", "2026-07-12", "2026-07-12T18:00:00Z"),
            makeItem("b", "2026-07-12", "2026-07-12T08:00:00Z"),
        ];

        const groups = groupByDay(items);

        expect(groups).toHaveLength(1);
        expect(groups[0]?.items).toHaveLength(2);
    });

    it("latest es el primer item del grupo (recordedAt mayor)", () => {
        const items = [
            makeItem("late", "2026-07-12", "2026-07-12T18:00:00Z"),
            makeItem("early", "2026-07-12", "2026-07-12T08:00:00Z"),
        ];

        const groups = groupByDay(items);

        expect(groups[0]?.latest.id).toBe("late");
    });
});
