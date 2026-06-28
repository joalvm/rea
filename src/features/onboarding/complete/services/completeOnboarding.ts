import type { Database } from "@/db/client";
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
    const intent = draft.intent;
    const mode = intent?.currentMode ?? "cycle_tracking";

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

            if (mode === "pregnancy") {
                await tx.insert(reproductiveIntentHistory).values({
                    id: uuid(),
                    profileId,
                    effectiveFrom: today,
                    currentMode: "pregnancy",
                    cycleIntent: null,
                    regularity: "irregular",
                    hormonalContraception: false,
                    declaredCycleLength: 28,
                    declaredPeriodLength: 5,
                    createdAt: now,
                    updatedAt: now,
                });
            } else {
                await tx.insert(reproductiveIntentHistory).values({
                    id: uuid(),
                    profileId,
                    effectiveFrom: today,
                    currentMode: mode,
                    cycleIntent: mode === "cycle_tracking" ? (intent?.cycleIntent ?? "track_only") : null,
                    regularity: draft.regularity,
                    hormonalContraception: draft.hormonalContraception,
                    declaredCycleLength: draft.cycleLength,
                    declaredPeriodLength: draft.periodLength,
                    createdAt: now,
                    updatedAt: now,
                });
            }

            if (mode === "pregnancy" && draft.pregnancyLmp) {
                await tx.insert(pregnancyEpisode).values({
                    id: uuid(),
                    profileId,
                    lmpDate: draft.pregnancyLmp,
                    dueDate: draft.pregnancyDueDate ?? undefined,
                    createdAt: now,
                    updatedAt: now,
                });
            }

            if ((mode === "cycle_tracking" || mode === "ttc") && draft.lastPeriodStart) {
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
