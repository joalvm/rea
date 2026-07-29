import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import { pregnancyEpisode } from "@/db/schema/pregnancyEpisode";
import { reproductiveIntentHistory } from "@/db/schema/reproductiveIntentHistory";
import { completeOnboarding } from "@/features/onboarding/complete/services/completeOnboarding";
import type { OnboardingDraft } from "@/features/onboarding/shared/types/OnboardingDraft";
import { INITIAL_ONBOARDING_DRAFT } from "@/features/onboarding/shared/types/OnboardingDraft";
import { transitionToPregnancy } from "@/domain/pregnancy/transitionToPregnancy";
import { type FileDatabase, createFileDatabase } from "@test/utils/createFileDatabase";

let database: FileDatabase | null = null;

beforeEach(async () => {
    database = await createFileDatabase();
});

afterEach(() => {
    database?.close();
    database = null;
});

function buildDraft(): OnboardingDraft {
    return {
        ...INITIAL_ONBOARDING_DRAFT,
        name: "María",
        birthYear: 1996,
        intent: { reproductiveMode: "tracking_avoid_pregnancy" },
        lastPeriodStart: "2026-06-20",
        lastPeriodEnd: "2026-06-24",
        lastPeriodOngoing: false,
    };
}

describe("Integración de transitionToPregnancy", () => {
    it("cierra avoid, abre embarazo y conserva el historial", async () => {
        if (!database) throw new Error("base no inicializada");
        const db = database.db as unknown as Database;
        const profileId = await completeOnboarding(db, buildDraft());

        const transition = await transitionToPregnancy(db, {
            profileId,
            effectiveFrom: "2026-07-29",
            lmpDate: "2026-06-20",
        });

        const intents = await db
            .select()
            .from(reproductiveIntentHistory)
            .where(eq(reproductiveIntentHistory.profileId, profileId));
        const episode = await db.select().from(pregnancyEpisode).where(eq(pregnancyEpisode.profileId, profileId));

        expect(intents).toHaveLength(2);
        expect(intents.find((item) => item.reproductiveMode === "tracking_avoid_pregnancy")?.effectiveTo).toBe(
            "2026-07-29",
        );
        expect(intents.find((item) => item.reproductiveMode === "pregnancy_tracking")?.effectiveTo).toBeNull();
        expect(episode).toHaveLength(1);
        expect(episode[0]?.id).toBe(transition.episodeId);
        expect(episode[0]?.dueDate).toBe("2027-03-27");
    });
});
