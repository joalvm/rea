import type { Database } from "@/db/client";
import { isPregnancyMode } from "@/db/enums/reproductiveMode";
import { appSettings } from "@/db/schema/appSettings";
import { periodRun } from "@/db/schema/periodRun";
import { pregnancyEpisode } from "@/db/schema/pregnancyEpisode";
import { profile } from "@/db/schema/profile";
import { reproductiveIntentHistory } from "@/db/schema/reproductiveIntentHistory";
import uuid from "@/db/utils/uuid";
import type { OnboardingDraft } from "@/features/onboarding/shared/types/OnboardingDraft";

function todayLocalISO(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

export async function completeOnboarding(database: Database, draft: OnboardingDraft): Promise<string> {
    const now = new Date().toISOString();
    const today = todayLocalISO();
    const profileId = uuid();
    const mode = draft.intent?.reproductiveMode ?? "tracking_only";
    const pregnancy = isPregnancyMode(mode);

    try {
        await database.transaction(async (tx) => {
            await tx.insert(profile).values({
                id: profileId,
                name: draft.name.trim(),
                birthYear: draft.birthYear ?? undefined,
                createdAt: now,
                updatedAt: now,
            });

            await tx.insert(appSettings).values({
                userId: profileId,
                remindersEnabled: draft.remindersEnabled,
                reminderIntervalHours: draft.reminderIntervalHours,
                reminderWindowStart: draft.reminderWindowStart,
                reminderWindowEnd: draft.reminderWindowEnd,
                onboardingCompletedAt: now,
                createdAt: now,
                updatedAt: now,
            });

            await tx.insert(reproductiveIntentHistory).values({
                id: uuid(),
                profileId,
                effectiveFrom: today,
                reproductiveMode: mode,
                regularity: pregnancy ? "irregular" : draft.regularity,
                hormonalContraception: pregnancy ? false : draft.hormonalContraception,
                declaredCycleLength: pregnancy ? 28 : draft.cycleLength,
                declaredPeriodLength: pregnancy ? 5 : draft.periodLength,
                createdAt: now,
                updatedAt: now,
            });

            if (pregnancy && draft.pregnancyLmp) {
                await tx.insert(pregnancyEpisode).values({
                    id: uuid(),
                    profileId,
                    lmpDate: draft.pregnancyLmp,
                    dueDate: draft.pregnancyDueDate ?? undefined,
                    createdAt: now,
                    updatedAt: now,
                });
            }

            if (!pregnancy && draft.lastPeriodStart) {
                await tx.insert(periodRun).values({
                    id: uuid(),
                    profileId,
                    startDate: draft.lastPeriodStart,
                    endDate: draft.lastPeriodOngoing ? undefined : (draft.lastPeriodEnd ?? undefined),
                    status: draft.lastPeriodOngoing ? "open" : "closed",
                    source: "user_confirmed",
                    createdAt: now,
                    updatedAt: now,
                });
            }
        });
    } catch (error) {
        console.error("Error completing onboarding:", error);
        throw error;
    }

    return profileId;
}
