import { describe, expect, it } from "@jest/globals";

import {
    type IntentKey,
    INTENT_CHOICES,
    INITIAL_ONBOARDING_DRAFT,
    findIntent,
    isProfileComplete,
} from "@/features/onboarding/shared/types/OnboardingDraft";
import { profileSchema, MAX_BIRTH_YEAR, MIN_BIRTH_YEAR } from "@/features/onboarding/profile/schemas/profileSchema";

describe("Helpers del borrador de onboarding", () => {
    it("expone las cuatro intenciones con el reproductive_mode correcto", () => {
        const byKey = Object.fromEntries(INTENT_CHOICES.map((choice) => [choice.key, choice]));

        expect(byKey.track).toEqual({ key: "track", reproductiveMode: "tracking_only" });
        expect(byKey.avoid).toEqual({ key: "avoid", reproductiveMode: "tracking_avoid_pregnancy" });
        expect(byKey.ttc).toEqual({ key: "ttc", reproductiveMode: "tracking_ttc" });
        expect(byKey.preg).toEqual({ key: "preg", reproductiveMode: "pregnancy_tracking" });
    });

    it("encuentra una intención por clave y devuelve undefined para claves desconocidas", () => {
        expect(findIntent("track" as IntentKey)?.reproductiveMode).toBe("tracking_only");
        expect(findIntent("preg" as IntentKey)?.reproductiveMode).toBe("pregnancy_tracking");
    });

    it("exige un nombre con trim y un año de nacimiento para considerar completo el perfil", () => {
        expect(isProfileComplete(INITIAL_ONBOARDING_DRAFT)).toBe(false);
        expect(isProfileComplete({ ...INITIAL_ONBOARDING_DRAFT, name: "  " })).toBe(false);
        expect(isProfileComplete({ ...INITIAL_ONBOARDING_DRAFT, name: "María" })).toBe(false);
        expect(isProfileComplete({ ...INITIAL_ONBOARDING_DRAFT, name: "María", birthYear: 1996 })).toBe(true);
    });

    it("normaliza la entrada de perfil y hace cumplir el rango de año de nacimiento", () => {
        const valid = profileSchema.safeParse({
            birthYear: 1996,
            name: "  María  ",
        });

        expect(valid.success).toBe(true);

        if (!valid.success) {
            throw new Error("se esperaba un perfil de onboarding válido");
        }

        expect(valid.data).toEqual({
            birthYear: 1996,
            name: "María",
        });

        expect(
            profileSchema.safeParse({
                birthYear: MIN_BIRTH_YEAR - 1,
                name: "María",
            }).success,
        ).toBe(false);

        expect(
            profileSchema.safeParse({
                birthYear: MAX_BIRTH_YEAR + 1,
                name: "María",
            }).success,
        ).toBe(false);
    });
});
