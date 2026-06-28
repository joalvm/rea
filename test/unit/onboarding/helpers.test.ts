import { describe, expect, it } from "@jest/globals";

import {
    type IntentKey,
    INTENT_CHOICES,
    INITIAL_ONBOARDING_DRAFT,
    findIntent,
    isProfileComplete,
} from "@/features/onboarding/shared/types/OnboardingDraft";

describe("onboarding draft helpers", () => {
    it("exposes the four intent choices with the right (mode, cycle_intent) pairs", () => {
        const byKey = Object.fromEntries(INTENT_CHOICES.map((choice) => [choice.key, choice]));

        expect(byKey.track).toEqual({ key: "track", currentMode: "cycle_tracking", cycleIntent: "track_only" });
        expect(byKey.avoid).toEqual({ key: "avoid", currentMode: "cycle_tracking", cycleIntent: "avoid_pregnancy" });
        expect(byKey.ttc).toEqual({ key: "ttc", currentMode: "ttc", cycleIntent: null });
        expect(byKey.preg).toEqual({ key: "preg", currentMode: "pregnancy", cycleIntent: null });
    });

    it("finds an intent by key and returns undefined for unknown keys", () => {
        expect(findIntent("track" as IntentKey)?.currentMode).toBe("cycle_tracking");
        expect(findIntent("preg" as IntentKey)?.cycleIntent).toBeNull();
    });

    it("requires a trimmed name and a birth year to consider profile complete", () => {
        expect(isProfileComplete(INITIAL_ONBOARDING_DRAFT)).toBe(false);
        expect(isProfileComplete({ ...INITIAL_ONBOARDING_DRAFT, name: "  " })).toBe(false);
        expect(isProfileComplete({ ...INITIAL_ONBOARDING_DRAFT, name: "María" })).toBe(false);
        expect(isProfileComplete({ ...INITIAL_ONBOARDING_DRAFT, name: "María", birthYear: 1996 })).toBe(true);
    });
});
