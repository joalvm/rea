import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { intercourseLog } from "@/db/schema/intercourseLog";
import { profile } from "@/db/schema/profile";
import { intercourseLogSeed, seedIntercourseLog } from "@test/integration/db/seeders/intercourseLogSeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("Integración del esquema de intercourseLog", () => {
    it("inserta y consulta un evento válido de relaciones sexuales", async () => {
        await seedProfile(context.database);
        await seedIntercourseLog(context.database);

        const rows = await context.database.db
            .select()
            .from(intercourseLog)
            .where(eq(intercourseLog.id, intercourseLogSeed.id));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.profileId).toBe(profileSeed.id);
    });

    it("rechaza filas huérfanas y valores inválidos de fecha o bandera de protección", async () => {
        await expect(
            seedIntercourseLog(context.database, {
                id: "intercourse-orphan",
                profileId: "missing-profile",
            }),
        ).rejects.toThrow();

        await seedProfile(context.database);

        await expect(
            seedIntercourseLog(context.database, {
                id: "intercourse-invalid-date",
                localDate: "bad-date",
            }),
        ).rejects.toThrow();

        await expect(
            context.database.client.execute({
                sql: `
                    INSERT INTO intercourse_log (
                        id, user_id, occurred_at, local_date, protected, in_fertile_window, created_at, updated_at, version
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                args: [
                    "intercourse-invalid-protected",
                    profileSeed.id,
                    "2026-04-03T21:15:00Z",
                    "2026-04-03",
                    3,
                    1,
                    "2026-04-03T21:15:00Z",
                    "2026-04-03T21:15:00Z",
                    1,
                ],
            }),
        ).rejects.toThrow();

        await expect(
            context.database.client.execute({
                sql: `
                    INSERT INTO intercourse_log (
                        id, user_id, occurred_at, local_date, protected, in_fertile_window, created_at, updated_at, version
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                args: [
                    "intercourse-invalid-fertile-window",
                    profileSeed.id,
                    "2026-04-04T21:15:00Z",
                    "2026-04-04",
                    1,
                    3,
                    "2026-04-04T21:15:00Z",
                    "2026-04-04T21:15:00Z",
                    1,
                ],
            }),
        ).rejects.toThrow();
    });

    it("elimina en cascada cuando se elimina el perfil propietario", async () => {
        await seedProfile(context.database);
        await seedIntercourseLog(context.database);

        await context.database.db.delete(profile).where(eq(profile.id, profileSeed.id));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM intercourse_log");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });
});
