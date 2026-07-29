import { describe, expect, it } from "@jest/globals";

import type { ReaBackup } from "@/domain/backup/serializeBackup";
import { summarizeBackup } from "@/domain/backup/summarizeBackup";

describe("Resumen de backup", () => {
    it("calcula conteos y rango temporal para la confirmación", () => {
        const backup = {
            tables: {
                checkins: [{ localDate: "2026-07-02" }, { localDate: "2026-07-04" }],
                cycleRecords: [{ startDate: "2026-06-01", endDate: "2026-06-28" }],
            },
        } as unknown as ReaBackup;

        expect(summarizeBackup(backup)).toEqual({
            checkinCount: 2,
            cycleCount: 1,
            from: "2026-06-01",
            to: "2026-07-04",
        });
    });
});
