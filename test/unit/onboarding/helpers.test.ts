import { describe, expect, it } from "@jest/globals";

import {
    type IntentKey,
    INTENT_CHOICES,
    INITIAL_ONBOARDING_DRAFT,
    findIntent,
    isProfileComplete,
} from "@/features/onboarding/shared/types/OnboardingDraft";

describe("onboarding draft helpers", () => {
    it("exposes the four intent choices with the right reproductive_mode", () => {
        const byKey = Object.fromEntries(INTENT_CHOICES.map((choice) => [choice.key, choice]));

        expect(byKey.track).toEqual({ key: "track", reproductiveMode: "tracking_only" });
        expect(byKey.avoid).toEqual({ key: "avoid", reproductiveMode: "tracking_avoid_pregnancy" });
        expect(byKey.ttc).toEqual({ key: "ttc", reproductiveMode: "tracking_ttc" });
        expect(byKey.preg).toEqual({ key: "preg", reproductiveMode: "pregnancy_tracking" });
    });

    it("finds an intent by key and returns undefined for unknown keys", () => {
        expect(findIntent("track" as IntentKey)?.reproductiveMode).toBe("tracking_only");
        expect(findIntent("preg" as IntentKey)?.reproductiveMode).toBe("pregnancy_tracking");
    });

    it("requires a trimmed name and a birth year to consider profile complete", () => {
        expect(isProfileComplete(INITIAL_ONBOARDING_DRAFT)).toBe(false);
        expect(isProfileComplete({ ...INITIAL_ONBOARDING_DRAFT, name: "  " })).toBe(false);
        expect(isProfileComplete({ ...INITIAL_ONBOARDING_DRAFT, name: "María" })).toBe(false);
        expect(isProfileComplete({ ...INITIAL_ONBOARDING_DRAFT, name: "María", birthYear: 1996 })).toBe(true);
    });
});
