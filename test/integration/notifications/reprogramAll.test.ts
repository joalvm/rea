import { afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import { appSettings } from "@/db/schema/appSettings";
import { profile } from "@/db/schema/profile";
import { reprogramAll } from "@/modules/notifications/reprogramAll";
import * as Scheduler from "@/modules/notifications/scheduler";
import { type FileDatabase, createFileDatabase } from "@test/utils/createFileDatabase";

// Espiamos el adaptador al scheduler nativo: el único punto del módulo que
// toca `expo-notifications`. `reprogramAll` accede a las funciones vía
// namespace (`Scheduler.*`), así que el espía intercepta sus llamadas sin
// pelearse con el hoisting de `jest.mock`.
const cancelAllScheduledSpy = jest.spyOn(Scheduler, "cancelAllScheduled").mockResolvedValue(undefined);
const scheduleDailySpy = jest.spyOn(Scheduler, "scheduleDaily").mockResolvedValue(undefined);

let database: FileDatabase | null = null;

beforeEach(async () => {
    database = await createFileDatabase();
    cancelAllScheduledSpy.mockClear();
    scheduleDailySpy.mockClear();

    await database.db
        .insert(profile)
        .values({ id: "profile-1", name: "Rea", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" });
    await database.db.insert(appSettings).values({
        userId: "profile-1",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
    });
});

afterEach(() => {
    database?.close();
    database = null;
});

const resolveCopy = () => ({ title: "Rea", body: "tienes un recordatorio" });

function identifiersScheduled(): (string | undefined)[] {
    return scheduleDailySpy.mock.calls.map((call) => (call[0] as { identifier: string }).identifier);
}

describe("Integración de reprogramAll", () => {
    it("cuando reminders_enabled esta apagado solo cancela y no programa nada", async () => {
        await database!.db
            .update(appSettings)
            .set({ remindersEnabled: false })
            .where(eq(appSettings.userId, "profile-1"));

        await reprogramAll(database!.db as unknown as Database, { resolveCopy });

        expect(cancelAllScheduledSpy).toHaveBeenCalledTimes(1);
        expect(scheduleDailySpy).not.toHaveBeenCalled();
    });

    it("cuando notify_daily_checkin esta apagado solo cancela y no programa nada", async () => {
        await database!.db
            .update(appSettings)
            .set({ notifyDailyCheckin: false })
            .where(eq(appSettings.userId, "profile-1"));

        await reprogramAll(database!.db as unknown as Database, { resolveCopy });

        expect(cancelAllScheduledSpy).toHaveBeenCalledTimes(1);
        expect(scheduleDailySpy).not.toHaveBeenCalled();
    });

    it("con la ventana por defecto (09-22 cada 6h) programa 3 slots con identifiers estables", async () => {
        await reprogramAll(database!.db as unknown as Database, { resolveCopy });

        expect(scheduleDailySpy).toHaveBeenCalledTimes(3);
        expect(identifiersScheduled()).toEqual(["daily_checkin_9_0", "daily_checkin_15_0", "daily_checkin_21_0"]);
    });

    it("es idempotente: dos llamadas programan el mismo set de identifiers", async () => {
        await reprogramAll(database!.db as unknown as Database, { resolveCopy });
        const firstRun = identifiersScheduled();

        await reprogramAll(database!.db as unknown as Database, { resolveCopy });
        const secondRun = identifiersScheduled().slice(firstRun.length);

        expect(cancelAllScheduledSpy).toHaveBeenCalledTimes(2);
        expect(firstRun).toEqual(secondRun);
    });

    it("respeta la ventana y el intervalo configurados", async () => {
        await database!.db
            .update(appSettings)
            .set({ reminderWindowStart: "08:00", reminderWindowEnd: "20:00", reminderIntervalHours: 3 })
            .where(eq(appSettings.userId, "profile-1"));

        await reprogramAll(database!.db as unknown as Database, { resolveCopy });

        expect(identifiersScheduled()).toEqual([
            "daily_checkin_8_0",
            "daily_checkin_11_0",
            "daily_checkin_14_0",
            "daily_checkin_17_0",
        ]);
    });
});
