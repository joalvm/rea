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
            throw new Error("File database accessed before initialization");
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

describe("completeOnboarding integration", () => {
    it("persists tracking_only with a closed period run", async () => {
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

    it("persists tracking_avoid_pregnancy without a period run when none is provided", async () => {
        await completeOnboarding(
            context.database.db as unknown as Database,
            buildDraft({
                intent: intent({ reproductiveMode: "tracking_avoid_pregnancy" }),
                lastPeriodStart: null,
                lastPeriodEnd: null,
            }),
        );

        const intents = await context.database.db.select().from(reproductiveIntentHistory);
        expect(intents[0]?.reproductiveMode).toBe("tracking_avoid_pregnancy");
        expect(intents[0]?.hormonalContraception).toBe(false);

        const runs = await context.database.db.select().from(periodRun);
        expect(runs).toHaveLength(0);
    });

    it("persists tracking_ttc with forced no hormonal contraception", async () => {
        await completeOnboarding(
            context.database.db as unknown as Database,
            buildDraft({
                intent: intent({ reproductiveMode: "tracking_ttc" }),
                hormonalContraception: false,
            }),
        );

        const intents = await context.database.db.select().from(reproductiveIntentHistory);
        expect(intents[0]?.reproductiveMode).toBe("tracking_ttc");
    });

    it("persists pregnancy_tracking with neutral defaults and an open episode", async () => {
        await completeOnboarding(
            context.database.db as unknown as Database,
            buildDraft({
                intent: intent({ reproductiveMode: "pregnancy_tracking" }),
                regularity: "regular",
                hormonalContraception: true,
                cycleLength: 21,
                periodLength: 3,
                pregnancyLmp: "2026-02-10",
                pregnancyDueDate: null,
            }),
        );

        const intents = await context.database.db.select().from(reproductiveIntentHistory);
        expect(intents[0]?.reproductiveMode).toBe("pregnancy_tracking");
        expect(intents[0]?.regularity).toBe("irregular");
        expect(intents[0]?.hormonalContraception).toBe(false);
        expect(intents[0]?.declaredCycleLength).toBe(28);
        expect(intents[0]?.declaredPeriodLength).toBe(5);

        const pregnancies = await context.database.db.select().from(pregnancyEpisode);
        expect(pregnancies).toHaveLength(1);
        expect(pregnancies[0]?.lmpDate).toBe("2026-02-10");
        expect(pregnancies[0]?.endDate).toBeNull();

        const runs = await context.database.db.select().from(periodRun);
        expect(runs).toHaveLength(0);
    });

    it("rolls back everything when a CHECK constraint is violated", async () => {
        await expect(
            completeOnboarding(
                context.database.db as unknown as Database,
                buildDraft({
                    intent: intent({ reproductiveMode: "tracking_ttc" }),
                    hormonalContraception: true,
                }),
            ),
        ).rejects.toThrow();

        const profiles = await context.database.client.execute("SELECT COUNT(*) AS total FROM user_profile");
        expect(Number(profiles.rows[0]?.total ?? 0)).toBe(0);

        const settings = await context.database.client.execute("SELECT COUNT(*) AS total FROM app_settings");
        expect(Number(settings.rows[0]?.total ?? 0)).toBe(0);
    });
});
