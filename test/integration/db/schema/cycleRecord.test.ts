import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { cycleRecord } from "@/db/schema/cycleRecord";
import { profile } from "@/db/schema/profile";
import { cycleRecordSeed, seedCycleRecord } from "@test/integration/db/seeders/cycleRecordSeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("Integración del esquema de cycleRecord", () => {
    it("inserta y consulta una fila válida de ciclo cerrado", async () => {
        await seedProfile(context.database);
        await seedCycleRecord(context.database);

        const rows = await context.database.db
            .select()
            .from(cycleRecord)
            .where(eq(cycleRecord.id, cycleRecordSeed.id));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.profileId).toBe(profileSeed.id);
        expect(rows[0]?.isValid).toBe(true);
    });

    it("rechaza filas huérfanas", async () => {
        await expect(
            seedCycleRecord(context.database, {
                id: "cycle-record-orphan",
                profileId: "missing-profile",
            }),
        ).rejects.toThrow();
    });

    it("rechaza (user_id, start_date) duplicado", async () => {
        await seedProfile(context.database);
        await seedCycleRecord(context.database);

        await expect(
            seedCycleRecord(context.database, {
                id: "cycle-record-duplicate-start",
            }),
        ).rejects.toThrow();
    });

    it("rechaza end_date anterior a start_date", async () => {
        await seedProfile(context.database);

        await expect(
            seedCycleRecord(context.database, {
                id: "cycle-record-bad-range",
                startDate: "2026-06-10",
                endDate: "2026-06-01",
            }),
        ).rejects.toThrow();
    });

    it("rechaza un valor desconocido de ovulation_basis", async () => {
        await seedProfile(context.database);

        await expect(
            seedCycleRecord(context.database, {
                id: "cycle-record-unknown-basis",
                ovulationDate: "2026-06-14",
                ovulationBasis: "horoscope" as never,
            }),
        ).rejects.toThrow();
    });

    it("rechaza ovulation_date fuera del rango del ciclo", async () => {
        await seedProfile(context.database);

        await expect(
            seedCycleRecord(context.database, {
                id: "cycle-record-ovulation-out-of-range",
                ovulationDate: "2026-07-01",
                ovulationBasis: "bbt",
            }),
        ).rejects.toThrow();
    });

    it("elimina en cascada cuando se elimina el perfil propietario", async () => {
        await seedProfile(context.database);
        await seedCycleRecord(context.database);

        await context.database.db.delete(profile).where(eq(profile.id, profileSeed.id));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM cycle_records");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });
});
