import { describe, expect, it, jest } from "@jest/globals";

import { DATABASE_VERSION } from "@/db/config";
import { initializeDatabase, resetDatabase } from "@/db/initializeDatabase";

type DatabaseDouble = {
    execAsync: (source: string) => Promise<unknown>;
    getFirstAsync: (source: string) => Promise<{ user_version: number } | null>;
};

function createDatabaseDouble(currentVersion: number): jest.Mocked<DatabaseDouble> {
    return {
        execAsync: jest.fn(async () => undefined),
        getFirstAsync: jest.fn(async () => ({ user_version: currentVersion })),
    };
}

describe("initializeDatabase", () => {
    it("skips the schema reset when the stored version is current", async () => {
        const database = createDatabaseDouble(DATABASE_VERSION);

        await initializeDatabase(database);

        expect(database.getFirstAsync).toHaveBeenCalledWith("PRAGMA user_version");
        expect(database.execAsync.mock.calls).toEqual([["PRAGMA journal_mode = WAL;"], ["PRAGMA foreign_keys = ON;"]]);
    });

    it("resets the schema when the stored version is outdated", async () => {
        const database = createDatabaseDouble(DATABASE_VERSION - 1);

        await initializeDatabase(database);

        const executedStatements = database.execAsync.mock.calls.map(([statement]) => statement);

        expect(executedStatements[0]).toBe("PRAGMA journal_mode = WAL;");
        expect(executedStatements[1]).toBe("PRAGMA foreign_keys = ON;");
        expect(executedStatements).toContain("PRAGMA foreign_keys = OFF;");
        expect(executedStatements).toContain(`PRAGMA user_version = ${DATABASE_VERSION};`);
        expect(executedStatements.at(-1)).toBe("PRAGMA foreign_keys = ON;");
    });
});

describe("resetDatabase", () => {
    it("re-enables foreign keys even when the reset fails", async () => {
        const database = {
            execAsync: jest.fn(async (_source: string) => undefined),
        };
        const failure = new Error("drop failed");

        database.execAsync.mockImplementationOnce(async () => undefined);
        database.execAsync.mockImplementationOnce(async () => {
            throw failure;
        });
        database.execAsync.mockImplementation(async () => undefined);

        await expect(resetDatabase(database)).rejects.toThrow(failure);

        const executedStatements = database.execAsync.mock.calls.map(([statement]) => statement);

        expect(executedStatements[0]).toBe("PRAGMA foreign_keys = OFF;");
        expect(executedStatements.at(-1)).toBe("PRAGMA foreign_keys = ON;");
    });
});
