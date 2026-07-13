import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";

import type { Database } from "@/db/client";
import { checkin } from "@/db/schema/checkin";
import { listCheckins } from "@/features/diary/diary/services/listCheckins";
import { type FileDatabase, createFileDatabase } from "@test/utils/createFileDatabase";

import { seedProfile, profileSeed } from "../db/seeders/profileSeeder";

let database: FileDatabase | null = null;

beforeEach(async () => {
    database = await createFileDatabase();
});
afterEach(() => {
    database?.close();
    database = null;
});

const context = {
    get database() {
        if (database == null) {
            throw new Error("se accedió a la base de datos de archivo antes de inicializarla");
        }
        return database;
    },
};

async function insertCheckinRow(
    db: Database,
    overrides: {
        id: string;
        recordedAt: string;
        localDate: string;
        bleedingIntensity?: number;
        note?: string;
        deletedAt?: string | null;
        excludedFromSummary?: number;
    },
) {
    const now = "2026-07-01T00:00:00Z";
    await db.insert(checkin).values({
        id: overrides.id,
        profileId: profileSeed.id,
        recordedAt: overrides.recordedAt,
        localDate: overrides.localDate,
        bleedingIntensity: overrides.bleedingIntensity,
        note: overrides.note,
        deletedAt: overrides.deletedAt ?? null,
        excludedFromSummary: overrides.excludedFromSummary ?? 0,
        createdAt: now,
        updatedAt: now,
    });
}

describe("Integración de listCheckins", () => {
    it("devuelve [] cuando el rango no tiene check-ins", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);

        const rows = await listCheckins(db, {
            profileId: profileSeed.id,
            from: "2026-07-01",
            to: "2026-07-31",
        });

        expect(rows).toEqual([]);
    });

    it("devuelve los check-ins del rango ordenados desc por recordedAt", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);

        await insertCheckinRow(db, {
            id: "c-1",
            recordedAt: "2026-07-12T08:00:00Z",
            localDate: "2026-07-12",
            bleedingIntensity: 1,
        });
        await insertCheckinRow(db, {
            id: "c-2",
            recordedAt: "2026-07-12T18:00:00Z",
            localDate: "2026-07-12",
            note: "tarde",
        });
        await insertCheckinRow(db, {
            id: "c-3",
            recordedAt: "2026-07-10T10:00:00Z",
            localDate: "2026-07-10",
            bleedingIntensity: 3,
        });

        const rows = await listCheckins(db, {
            profileId: profileSeed.id,
            from: "2026-07-01",
            to: "2026-07-31",
        });

        expect(rows).toHaveLength(3);
        expect(rows.map((r) => r.id)).toEqual(["c-2", "c-1", "c-3"]);
        expect(rows[0]?.note).toBe("tarde");
        expect(rows[2]?.bleedingIntensity).toBe(3);
    });

    it("excluye los check-ins fuera del rango de fechas", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);

        await insertCheckinRow(db, {
            id: "c-prev",
            recordedAt: "2026-06-30T10:00:00Z",
            localDate: "2026-06-30",
        });
        await insertCheckinRow(db, {
            id: "c-in",
            recordedAt: "2026-07-15T10:00:00Z",
            localDate: "2026-07-15",
        });
        await insertCheckinRow(db, {
            id: "c-next",
            recordedAt: "2026-08-01T10:00:00Z",
            localDate: "2026-08-01",
        });

        const rows = await listCheckins(db, {
            profileId: profileSeed.id,
            from: "2026-07-01",
            to: "2026-07-31",
        });

        expect(rows).toHaveLength(1);
        expect(rows[0]?.id).toBe("c-in");
    });

    it("excluye los check-ins soft-deleted", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);

        await insertCheckinRow(db, {
            id: "c-alive",
            recordedAt: "2026-07-12T10:00:00Z",
            localDate: "2026-07-12",
        });
        await insertCheckinRow(db, {
            id: "c-deleted",
            recordedAt: "2026-07-12T18:00:00Z",
            localDate: "2026-07-12",
            deletedAt: "2026-07-13T00:00:00Z",
        });

        const rows = await listCheckins(db, {
            profileId: profileSeed.id,
            from: "2026-07-01",
            to: "2026-07-31",
        });

        expect(rows).toHaveLength(1);
        expect(rows[0]?.id).toBe("c-alive");
    });

    it("incluye el flag excludedFromSummary", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);

        await insertCheckinRow(db, {
            id: "c-excluded",
            recordedAt: "2026-07-12T10:00:00Z",
            localDate: "2026-07-12",
            excludedFromSummary: 1,
        });

        const rows = await listCheckins(db, {
            profileId: profileSeed.id,
            from: "2026-07-01",
            to: "2026-07-31",
        });

        expect(rows).toHaveLength(1);
        expect(rows[0]?.excludedFromSummary).toBe(1);
    });
});
