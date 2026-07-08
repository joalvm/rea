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

// El mock debe existir antes de este import (hoisting de jest.mock aparte,
// el hook se resuelve en tiempo de render, no de import).
// eslint-disable-next-line import/first
import { useTodaySummary } from "@/domain/hooks/useTodaySummary";

beforeEach(async () => {
    database = await createFileDatabase();
    mockedDatabase = database.db as unknown as Database;
});
afterEach(() => {
    database?.close();
    database = null;
    mockedDatabase = null;
});

/**
 * Harness mínimo con `react-test-renderer`: no hay `@testing-library/react-native`
 * en el proyecto y no rendereamos contra `expo-sqlite`/`SQLiteProvider` real (ver
 * límite documentado en el plan). Solo se prueba el render inicial correcto.
 */
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

describe("useTodaySummary", () => {
    it("expone el resumen de hoy cuando existe una fila para la fecha local actual", async () => {
        await seedProfile(database as unknown as never);
        const today = new Date().toISOString().slice(0, 10);
        await seedDailySummary(database as unknown as never, {
            localDate: today,
            isMenstruationDay: true,
        });

        const result = renderHookResult(() => useTodaySummary(profileSeed.id));

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.summary).toMatchObject({ profileId: profileSeed.id, localDate: today });
        expect(result.current.error).toBeUndefined();
    });

    it("expone summary null cuando no hay fila para hoy", async () => {
        await seedProfile(database as unknown as never);

        const result = renderHookResult(() => useTodaySummary(profileSeed.id));

        await act(async () => {
            await Promise.resolve();
        });

        expect(result.current.summary).toBeNull();
    });
});
