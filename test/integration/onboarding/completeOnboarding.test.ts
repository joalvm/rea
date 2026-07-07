import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import { appSettings } from "@/db/schema/appSettings";
import { periodRun } from "@/db/schema/periodRun";
import { pregnancyEpisode } from "@/db/schema/pregnancyEpisode";
import { profile } from "@/db/schema/profile";
import { reproductiveIntentHistory } from "@/db/schema/reproductiveIntentHistory";
import { completeOnboarding } from "@/features/onboarding/complete/services/completeOnboarding";
import type { IntentChoice, OnboardingDraft } from "@/features/onboarding/shared/types/OnboardingDraft";
import { INITIAL_ONBOARDING_DRAFT } from "@/features/onboarding/shared/types/OnboardingDraft";
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

function buildDraft(overrides: Partial<OnboardingDraft> = {}): OnboardingDraft {
    return {
        ...INITIAL_ONBOARDING_DRAFT,
        name: "María ",
        birthYear: 1996,
        intent: { reproductiveMode: "tracking_only" },
        lastPeriodStart: "2026-05-01",
        lastPeriodEnd: "2026-05-05",
        lastPeriodOngoing: false,
        ...overrides,
    };
}

const intent = (choice: IntentChoice): IntentChoice => choice;

describe("Integración de completeOnboarding", () => {
    it("persiste tracking_only con un tramo de periodo cerrado", async () => {
        const profileId = await completeOnboarding(context.database.db as unknown as Database, buildDraft());

        const profiles = await context.database.db.select().from(profile).where(eq(profile.id, profileId));
        expect(profiles).toHaveLength(1);
        expect(profiles[0]?.name).toBe("María");
        expect(profiles[0]?.birthYear).toBe(1996);

        const settings = await context.database.db.select().from(appSettings);
        expect(settings).toHaveLength(1);
        expect(settings[0]?.userId).toBe(profileId);
        expect(settings[0]?.onboardingCompletedAt).not.toBeNull();

        const intents = await context.database.db.select().from(reproductiveIntentHistory);
        expect(intents[0]?.reproductiveMode).toBe("tracking_only");

        const runs = await context.database.db.select().from(periodRun);
        expect(runs).toHaveLength(1);
        expect(runs[0]?.status).toBe("closed");
        expect(runs[0]?.source).toBe("user_confirmed");

        const pregnancies = await context.database.db.select().from(pregnancyEpisode);
        expect(pregnancies).toHaveLength(0);
    });

    it("persiste tracking_avoid_pregnancy con el método anticonceptivo declarado", async () => {
        await completeOnboarding(
            context.database.db as unknown as Database,
            buildDraft({
                intent: intent({ reproductiveMode: "tracking_avoid_pregnancy" }),
                lastPeriodStart: null,
                lastPeriodEnd: null,
                contraceptionMethod: "pill",
            }),
        );

        const intents = await context.database.db.select().from(reproductiveIntentHistory);
        expect(intents[0]?.reproductiveMode).toBe("tracking_avoid_pregnancy");
        expect(intents[0]?.contraceptionMethod).toBe("pill");

        const runs = await context.database.db.select().from(periodRun);
        expect(runs).toHaveLength(0);
    });

    it("persiste tracking_avoid_pregnancy con NULL cuando prefiere no decir el método", async () => {
        await completeOnboarding(
            context.database.db as unknown as Database,
            buildDraft({
                intent: intent({ reproductiveMode: "tracking_avoid_pregnancy" }),
                contraceptionMethod: null,
            }),
        );

        const intents = await context.database.db.select().from(reproductiveIntentHistory);
        expect(intents[0]?.contraceptionMethod).toBeNull();
    });

    it("persiste tracking_ttc forzando contraception_method='none' sin importar el borrador", async () => {
        await completeOnboarding(
            context.database.db as unknown as Database,
            buildDraft({
                intent: intent({ reproductiveMode: "tracking_ttc" }),
                contraceptionMethod: "pill",
            }),
        );

        const intents = await context.database.db.select().from(reproductiveIntentHistory);
        expect(intents[0]?.reproductiveMode).toBe("tracking_ttc");
        expect(intents[0]?.contraceptionMethod).toBe("none");
    });

    it("persiste pregnancy_tracking sin inventar datos de ciclo (NULL) y con un episodio abierto", async () => {
        await completeOnboarding(
            context.database.db as unknown as Database,
            buildDraft({
                intent: intent({ reproductiveMode: "pregnancy_tracking" }),
                regularity: "regular",
                contraceptionMethod: "pill",
                cycleLength: 21,
                periodLength: 3,
                pregnancyLmp: "2026-02-10",
                pregnancyDueDate: null,
                pregnancyDatingBasis: "lmp",
            }),
        );

        const intents = await context.database.db.select().from(reproductiveIntentHistory);
        expect(intents[0]?.reproductiveMode).toBe("pregnancy_tracking");
        expect(intents[0]?.regularity).toBeNull();
        expect(intents[0]?.contraceptionMethod).toBeNull();
        expect(intents[0]?.declaredCycleLength).toBeNull();
        expect(intents[0]?.declaredPeriodLength).toBeNull();

        const pregnancies = await context.database.db.select().from(pregnancyEpisode);
        expect(pregnancies).toHaveLength(1);
        expect(pregnancies[0]?.lmpDate).toBe("2026-02-10");
        expect(pregnancies[0]?.datingBasis).toBe("lmp");
        expect(pregnancies[0]?.endDate).toBeNull();

        const runs = await context.database.db.select().from(periodRun);
        expect(runs).toHaveLength(0);
    });

    it("persiste pregnancy_tracking anclado por FPP con dating_basis='due_date'", async () => {
        await completeOnboarding(
            context.database.db as unknown as Database,
            buildDraft({
                intent: intent({ reproductiveMode: "pregnancy_tracking" }),
                pregnancyLmp: "2026-02-10",
                pregnancyDueDate: "2026-11-17",
                pregnancyDatingBasis: "due_date",
            }),
        );

        const pregnancies = await context.database.db.select().from(pregnancyEpisode);
        expect(pregnancies[0]?.datingBasis).toBe("due_date");
        expect(pregnancies[0]?.dueDate).toBe("2026-11-17");
    });

    it("revierte todo cuando se viola una restricción CHECK", async () => {
        await expect(
            completeOnboarding(
                context.database.db as unknown as Database,
                buildDraft({
                    intent: intent({ reproductiveMode: "tracking_only" }),
                    cycleLength: 999,
                }),
            ),
        ).rejects.toThrow();

        const profiles = await context.database.client.execute("SELECT COUNT(*) AS total FROM user_profile");
        expect(Number(profiles.rows[0]?.total ?? 0)).toBe(0);

        const settings = await context.database.client.execute("SELECT COUNT(*) AS total FROM app_settings");
        expect(Number(settings.rows[0]?.total ?? 0)).toBe(0);
    });

    it("revierte todo cuando los recordatorios violan el contrato de la base de datos", async () => {
        await expect(
            completeOnboarding(
                context.database.db as unknown as Database,
                buildDraft({
                    reminderWindowStart: "22:00",
                    reminderWindowEnd: "09:00",
                }),
            ),
        ).rejects.toThrow();

        const profiles = await context.database.client.execute("SELECT COUNT(*) AS total FROM user_profile");
        expect(Number(profiles.rows[0]?.total ?? 0)).toBe(0);

        const settings = await context.database.client.execute("SELECT COUNT(*) AS total FROM app_settings");
        expect(Number(settings.rows[0]?.total ?? 0)).toBe(0);
    });
});
