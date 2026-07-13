import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import { checkin } from "@/db/schema/checkin";
import { dailySummary } from "@/db/schema/dailySummary";
import { deleteCheckin } from "@/features/diary/entry/services/deleteCheckin";
import { setCheckinExclusion } from "@/features/diary/entry/services/setCheckinExclusion";
import { seedCheckin } from "@test/integration/db/seeders/checkinSeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { seedReproductiveIntentHistory } from "@test/integration/db/seeders/reproductiveIntentHistorySeeder";
import { type FileDatabase, createFileDatabase } from "@test/utils/createFileDatabase";

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

describe("Integración de setCheckinExclusion", () => {
    it("marca excludedFromSummary = 1 y retorna changed: true", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        await seedCheckin(context.database, { id: "c-1", localDate: "2026-07-12", recordedAt: "2026-07-12T10:00:00Z" });

        const result = await setCheckinExclusion(db, {
            profileId: profileSeed.id,
            checkinId: "c-1",
            excluded: true,
        });

        expect(result).toEqual({ localDate: "2026-07-12", changed: true });

        const [row] = await db.select().from(checkin).where(eq(checkin.id, "c-1"));
        expect(row?.excludedFromSummary).toBe(1);
    });

    it("es idempotente al activar: segunda llamada no escribe ni recalcula", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        await seedCheckin(context.database, { id: "c-1", localDate: "2026-07-12", recordedAt: "2026-07-12T10:00:00Z" });

        await setCheckinExclusion(db, { profileId: profileSeed.id, checkinId: "c-1", excluded: true });
        const [before] = await db.select().from(checkin).where(eq(checkin.id, "c-1"));

        const result = await setCheckinExclusion(db, {
            profileId: profileSeed.id,
            checkinId: "c-1",
            excluded: true,
        });

        expect(result.changed).toBe(false);
        const [after] = await db.select().from(checkin).where(eq(checkin.id, "c-1"));
        // updatedAt no se tocó (no-op).
        expect(after?.updatedAt).toBe(before?.updatedAt);
    });

    it("es idempotente al desactivar cuando ya está en 0", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        await seedCheckin(context.database, { id: "c-1", localDate: "2026-07-12", recordedAt: "2026-07-12T10:00:00Z" });

        const [before] = await db.select().from(checkin).where(eq(checkin.id, "c-1"));

        const result = await setCheckinExclusion(db, {
            profileId: profileSeed.id,
            checkinId: "c-1",
            excluded: false,
        });

        expect(result.changed).toBe(false);
        const [after] = await db.select().from(checkin).where(eq(checkin.id, "c-1"));
        expect(after?.updatedAt).toBe(before?.updatedAt);
    });

    it("excluir un registro cambia la media de ánimo (lo ignora) pero conserva el dato", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        // Dos registros el mismo día con ánimos distintos: 2 y 4 → media 3.
        await seedCheckin(context.database, {
            id: "c-1",
            localDate: "2026-07-12",
            recordedAt: "2026-07-12T08:00:00Z",
            mood: 2,
        });
        await seedCheckin(context.database, {
            id: "c-2",
            localDate: "2026-07-12",
            recordedAt: "2026-07-12T18:00:00Z",
            mood: 4,
        });

        // Recálculo inicial (forzamos una mutación efectiva para que se cree la fila).
        await setCheckinExclusion(db, { profileId: profileSeed.id, checkinId: "c-1", excluded: true });
        const [excludedRow] = await db
            .select()
            .from(dailySummary)
            .where(eq(dailySummary.localDate, "2026-07-12"));
        // checkinCount cuenta TODOS los registros (el dato se conserva); no baja.
        expect(excludedRow?.checkinCount).toBe(2);
        // avgMood solo considera incluidos → 4 (solo c-2 cuenta).
        expect(excludedRow?.avgMood).not.toBeNull();
        expect(Number(excludedRow?.avgMood)).toBe(4);

        // Al re-incluir c-1, la media vuelve a 3 (promedio de 2 y 4).
        await setCheckinExclusion(db, { profileId: profileSeed.id, checkinId: "c-1", excluded: false });
        const [restoredRow] = await db
            .select()
            .from(dailySummary)
            .where(eq(dailySummary.localDate, "2026-07-12"));
        expect(restoredRow?.checkinCount).toBe(2);
        expect(restoredRow?.avgMood).not.toBeNull();
        expect(Number(restoredRow?.avgMood)).toBe(3);
    });

    it("lanza si el registro no existe o está borrado", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        await seedCheckin(context.database, { id: "c-1", localDate: "2026-07-12", recordedAt: "2026-07-12T10:00:00Z" });

        // Id inexistente.
        await expect(
            setCheckinExclusion(db, { profileId: profileSeed.id, checkinId: "no-existe", excluded: true }),
        ).rejects.toThrow();

        // Soft-delete previo → el toggle debe lanzar.
        await deleteCheckin(db, { profileId: profileSeed.id, checkinId: "c-1" });
        await expect(
            setCheckinExclusion(db, { profileId: profileSeed.id, checkinId: "c-1", excluded: true }),
        ).rejects.toThrow();
    });
});
