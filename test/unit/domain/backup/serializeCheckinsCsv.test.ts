import { describe, expect, it } from "@jest/globals";

import type { ReaBackup } from "@/domain/backup/serializeBackup";
import { serializeCheckinsCsv } from "@/domain/backup/serializeCheckinsCsv";

describe("Exportación CSV", () => {
    it("aplana check-ins y ciclos con claves legibles", () => {
        const backup = {
            tables: {
                checkins: [{ localDate: "2026-07-29", note: "dolor, leve" }],
                cycleRecords: [{ startDate: "2026-06-20", cycleLength: 28 }],
            },
        } as unknown as ReaBackup;

        const csv = serializeCheckinsCsv(backup);

        expect(csv).toContain("record_type,local_date");
        expect(csv).toContain('checkin,2026-07-29,,,,,,,,"dolor, leve"');
        expect(csv).toContain("cycle_summary,,,,,,,,,,2026-06-20");
    });
});
