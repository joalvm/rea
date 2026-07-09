import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, create } from "react-test-renderer";

import type { Database } from "@/db/client";
import { seedDailySummary } from "@test/integration/db/seeders/dailySummarySeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { type FileDatabase, createFileDatabase } from "@test/utils/createFileDatabase";

let database: FileDatabase | null = null;
let mockedDatabase: Database | null = null;

jest.mock("@/db/useDatabase", () => ({
    useDatabase: () => mockedDatabase,
}));

// eslint-disable-next-line import/first
import { useDailySummary } from "@/domain/hooks/useDailySummary";

beforeEach(async () => {
    database = await createFileDatabase();
    mockedDatabase = database.db as unknown as Database;
});
afterEach(() => {
    database?.close();
    database = null;
    mockedDatabase = null;
});

function renderHookResult<T>(callback: () => T): { current: T } {
    const result: { current: T } = { current: undefined as unknown as T };

    function TestComponent() {
        result.current = callback();
        return null;
    }

    act(() => {
        create(<TestComponent />);
    });
    return result;
}

describe("useDailySummary", () => {
    it("expone las filas dentro del rango, ordenadas por fecha", async () => {
        await seedProfile(database as unknown as never);
        await seedDailySummary(database as unknown as never, { localDate: "2026-01-03" });
        await seedDailySummary(database as unknown as never, { localDate: "2026-01-01" });
        await seedDailySummary(database as unknown as never, { localDate: "2026-02-01" }); // fuera del rango

        const result = renderHookResult(() =>
            useDailySummary(profileSeed.id, { from: "2026-01-01", to: "2026-01-31" }),
        );

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.summaries.map((row) => row.localDate)).toEqual(["2026-01-01", "2026-01-03"]);
    });

    it("expone un array vacío sin filas en el rango", async () => {
        await seedProfile(database as unknown as never);

        const result = renderHookResult(() =>
            useDailySummary(profileSeed.id, { from: "2026-01-01", to: "2026-01-31" }),
        );

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.summaries).toEqual([]);
    });
});
