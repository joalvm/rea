import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, create } from "react-test-renderer";

import type { Database } from "@/db/client";
import { seedCycleRecord } from "@test/integration/db/seeders/cycleRecordSeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { type FileDatabase, createFileDatabase } from "@test/utils/createFileDatabase";

let database: FileDatabase | null = null;
let mockedDatabase: Database | null = null;

jest.mock("@/db/useDatabase", () => ({
    useDatabase: () => mockedDatabase,
}));

// eslint-disable-next-line import/first
import { useCycleRecords } from "@/domain/hooks/useCycleRecords";

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

describe("useCycleRecords", () => {
    it("expone los últimos `limit` ciclos, más reciente primero", async () => {
        await seedProfile(database as unknown as never);
        await seedCycleRecord(database as unknown as never, { id: "cycle-1", startDate: "2026-01-01", endDate: "2026-01-28" });
        await seedCycleRecord(database as unknown as never, { id: "cycle-2", startDate: "2026-01-29", endDate: "2026-02-25" });
        await seedCycleRecord(database as unknown as never, { id: "cycle-3", startDate: "2026-02-26", endDate: "2026-03-25" });

        const result = renderHookResult(() => useCycleRecords(profileSeed.id, 2));

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.records.map((record) => record.startDate)).toEqual(["2026-02-26", "2026-01-29"]);
    });

    it("expone un array vacío sin ciclos cerrados", async () => {
        await seedProfile(database as unknown as never);

        const result = renderHookResult(() => useCycleRecords(profileSeed.id, 6));

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.records).toEqual([]);
    });
});
