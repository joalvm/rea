import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { act, create } from "react-test-renderer";

import type { Database } from "@/db/client";
import { seedCyclePrediction } from "@test/integration/db/seeders/cyclePredictionSeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { type FileDatabase, createFileDatabase } from "@test/utils/createFileDatabase";

let database: FileDatabase | null = null;
let mockedDatabase: Database | null = null;

jest.mock("@/db/useDatabase", () => ({
    useDatabase: () => mockedDatabase,
}));

// eslint-disable-next-line import/first
import { useCurrentPrediction } from "@/domain/hooks/useCurrentPrediction";

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

describe("useCurrentPrediction", () => {
    it("expone la fila con calculation_date más reciente", async () => {
        await seedProfile(database as unknown as never);
        await seedCyclePrediction(database as unknown as never, { calculationDate: "2026-06-01" });
        await seedCyclePrediction(database as unknown as never, { calculationDate: "2026-06-20" });

        const result = renderHookResult(() => useCurrentPrediction(profileSeed.id));

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.prediction).toMatchObject({ profileId: profileSeed.id, calculationDate: "2026-06-20" });
    });

    it("expone prediction null sin filas", async () => {
        await seedProfile(database as unknown as never);

        const result = renderHookResult(() => useCurrentPrediction(profileSeed.id));

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.prediction).toBeNull();
    });
});
