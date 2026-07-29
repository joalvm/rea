import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";

import type { Database } from "@/db/client";
import { completeOnboarding } from "@/features/onboarding/complete/services/completeOnboarding";
import type { OnboardingDraft } from "@/features/onboarding/shared/types/OnboardingDraft";
import { INITIAL_ONBOARDING_DRAFT } from "@/features/onboarding/shared/types/OnboardingDraft";
import { parseBackup, restoreBackup, serializeBackup } from "@/domain/backup/serializeBackup";
import { profile } from "@/db/schema/profile";
import { type FileDatabase, createFileDatabase } from "@test/utils/createFileDatabase";

let database: FileDatabase | null = null;

beforeEach(async () => {
    database = await createFileDatabase();
});

afterEach(() => {
    database?.close();
    database = null;
});

function draft(): OnboardingDraft {
    return {
        ...INITIAL_ONBOARDING_DRAFT,
        name: "María",
        birthYear: 1996,
        intent: { reproductiveMode: "tracking_only" },
        lastPeriodStart: "2026-06-20",
        lastPeriodEnd: "2026-06-24",
        lastPeriodOngoing: false,
    };
}

describe("backup local de Rea", () => {
    it("serializa y restaura todas las filas de la instalación", async () => {
        if (!database) throw new Error("base no inicializada");
        const db = database.db as unknown as Database;
        await completeOnboarding(db, draft());

        const backup = await serializeBackup(db);
        expect(backup.format).toBe("rea-backup");
        expect(backup.tables.profiles).toHaveLength(1);

        await restoreBackup(db, parseBackup(JSON.parse(JSON.stringify(backup)) as unknown));
        expect(await db.select().from(profile)).toHaveLength(1);
    });
});
