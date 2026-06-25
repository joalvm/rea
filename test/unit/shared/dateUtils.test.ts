import { describe, expect, it } from "@jest/globals";

import { capitalizeFirst } from "@/shared/utils/capitalizeFirst";
import { startOfDay } from "@/shared/utils/startOfDay";
import { toCalendarDate } from "@/shared/utils/toCalendarDate";

describe("toCalendarDate", () => {
    it("anchors a YYYY-MM-DD string at local noon to avoid timezone day shifts", () => {
        const date = toCalendarDate("2026-06-25");
        expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2026, 5, 25, 12]);
    });

    it("returns Date instances unchanged (same reference)", () => {
        const original = new Date(2026, 0, 1, 8, 30);
        expect(toCalendarDate(original)).toBe(original);
    });

    it("treats numbers as epoch milliseconds", () => {
        expect(toCalendarDate(0).getTime()).toBe(0);
    });

    it("respects an explicit time in an ISO datetime string", () => {
        expect(toCalendarDate("2026-06-25T00:00:00Z").getTime()).toBe(Date.UTC(2026, 5, 25));
    });
});

describe("capitalizeFirst", () => {
    it("capitalizes only the first letter", () => {
        expect(capitalizeFirst("junio")).toBe("Junio");
    });

    it("leaves an empty string untouched", () => {
        expect(capitalizeFirst("")).toBe("");
    });
});

describe("startOfDay", () => {
    it("zeroes the time component without mutating the input", () => {
        const input = new Date(2026, 5, 25, 13, 45, 10);
        const result = startOfDay(input);
        expect([result.getHours(), result.getMinutes(), result.getSeconds()]).toEqual([0, 0, 0]);
        expect(input.getHours()).toBe(13);
    });
});
