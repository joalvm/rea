import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, create } from "react-test-renderer";

import type { Database } from "@/db/client";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { seedReproductiveIntentHistory } from "@test/integration/db/seeders/reproductiveIntentHistorySeeder";
import { type FileDatabase, createFileDatabase } from "@test/utils/createFileDatabase";

let database: FileDatabase | null = null;
let mockedDatabase: Database | null = null;

jest.mock("@/db/useDatabase", () => ({
    useDatabase: () => mockedDatabase,
}));

// eslint-disable-next-line import/first
import { useActiveIntent } from "@/domain/hooks/useActiveIntent";

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

describe("useActiveIntent", () => {
    it("expone la intención vigente (effectiveTo NULL), ignorando historial cerrado", async () => {
        await seedProfile(database as unknown as never);
        await seedReproductiveIntentHistory(database as unknown as never, {
            id: "intent-closed",
            effectiveFrom: "2025-01-01",
            effectiveTo: "2025-12-31",
        });
        await seedReproductiveIntentHistory(database as unknown as never, {
            id: "intent-open",
            effectiveFrom: "2026-01-01",
            effectiveTo: null,
            reproductiveMode: "tracking_ttc",
        });

        const result = renderHookResult(() => useActiveIntent(profileSeed.id));

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.intent).toMatchObject({ id: "intent-open", reproductiveMode: "tracking_ttc" });
    });

    it("expone intent null sin fila vigente", async () => {
        await seedProfile(database as unknown as never);

        const result = renderHookResult(() => useActiveIntent(profileSeed.id));

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.intent).toBeNull();
    });
});
