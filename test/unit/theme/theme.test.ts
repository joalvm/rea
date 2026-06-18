import { describe, expect, it, jest } from "@jest/globals";

import { getTheme } from "@/theme/theme";
import { PHASE_KEYS } from "@/theme/types/PhaseColors";
import { toNavigationTheme } from "@/theme/utils/toNavigationTheme";

jest.mock("react-native-reanimated", () => ({
    Easing: {
        bezier: () => (value: number) => value,
        out: () => (value: number) => value,
        in: () => (value: number) => value,
        cubic: (value: number) => value,
    },
}));

const phaseRoleKeys = [
    "surface",
    "accent",
    "accentSubtle",
    "onSurface",
    "onSurfaceMuted",
    "elevatedSurface",
    "onElevatedSurface",
    "solid",
    "onSolid",
] as const;

const legacyPhaseRoleKeys = [
    "background",
    "accentSoft",
    "text",
    "textSecondary",
    "chipBackground",
    "chipText",
    "ctaBackground",
    "ctaText",
] as const;

describe("Sistema de tema", () => {
    it("reutiliza la misma referencia por modo", () => {
        expect(getTheme("light")).toBe(getTheme("light"));
        expect(getTheme("dark")).toBe(getTheme("dark"));
        expect(getTheme("light")).not.toBe(getTheme("dark"));
    });

    it("adapta y cachea el tema de navegación por tema resuelto", () => {
        const lightTheme = getTheme("light");
        const darkTheme = getTheme("dark");

        const lightNavigationTheme = toNavigationTheme(lightTheme);
        const repeatedLightNavigationTheme = toNavigationTheme(lightTheme);
        const darkNavigationTheme = toNavigationTheme(darkTheme);

        expect(lightNavigationTheme).toBe(repeatedLightNavigationTheme);
        expect(lightNavigationTheme.dark).toBe(false);
        expect(darkNavigationTheme.dark).toBe(true);

        expect(lightNavigationTheme.colors.primary).toBe(lightTheme.colors.primary);
        expect(lightNavigationTheme.colors.background).toBe(lightTheme.colors.background);
        expect(lightNavigationTheme.colors.card).toBe(lightTheme.colors.surface);
        expect(lightNavigationTheme.colors.text).toBe(lightTheme.colors.text);
        expect(lightNavigationTheme.colors.border).toBe(lightTheme.colors.border);
        expect(lightNavigationTheme.colors.notification).toBe(lightTheme.colors.danger);
    });

    it("expone todas las fases con roles visuales genéricos en ambos modos", () => {
        const themes = [getTheme("light"), getTheme("dark")];

        themes.forEach((theme) => {
            expect(Object.keys(theme.phases)).toHaveLength(PHASE_KEYS.length);

            PHASE_KEYS.forEach((phaseKey) => {
                const palette = theme.phases[phaseKey];

                phaseRoleKeys.forEach((roleKey) => {
                    expect(palette).toHaveProperty(roleKey);
                    expect(palette[roleKey]).toBeTruthy();
                });

                legacyPhaseRoleKeys.forEach((roleKey) => {
                    expect(palette).not.toHaveProperty(roleKey);
                });
            });
        });
    });
});
