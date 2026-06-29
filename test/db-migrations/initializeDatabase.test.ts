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

describe("Inicialización de la base de datos", () => {
    it("omite el reinicio del esquema cuando la versión guardada está vigente", async () => {
        const database = createDatabaseDouble(DATABASE_VERSION);

        await initializeDatabase(database);

        expect(database.getFirstAsync).toHaveBeenCalledWith("PRAGMA user_version");

        const executedStatements = database.execAsync.mock.calls.map(([statement]) => statement);

        expect(executedStatements[0]).toBe("PRAGMA journal_mode = WAL;");
        expect(executedStatements[1]).toBe("PRAGMA foreign_keys = ON;");
        expect(executedStatements).not.toContain("PRAGMA foreign_keys = OFF;");
        expect(executedStatements).toContainEqual(expect.stringContaining("INSERT INTO symptom_catalog"));
        expect(executedStatements).toContainEqual(expect.stringContaining("UPDATE symptom_catalog"));
    });

    it("reinicia el esquema cuando la versión guardada está desactualizada", async () => {
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

describe("Reinicio de la base de datos", () => {
    it("reactiva las claves foráneas incluso cuando el reinicio falla", async () => {
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
