import { describe, expect, it, jest } from "@jest/globals";

import { getTheme } from "@/theme/theme";
import { aqua, ink } from "@/theme/tokens/colors";
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

type Rgb = {
    r: number;
    g: number;
    b: number;
};

function toRgb(color: string, backdrop = "#FFFFFF"): Rgb {
    if (color.startsWith("#")) {
        const value = color.replace("#", "");

        return {
            r: Number.parseInt(value.slice(0, 2), 16) / 255,
            g: Number.parseInt(value.slice(2, 4), 16) / 255,
            b: Number.parseInt(value.slice(4, 6), 16) / 255,
        };
    }

    const rgbaMatch = /^rgba\((\d+),(\d+),(\d+),([0-9.]+)\)$/.exec(color);
    if (!rgbaMatch) {
        throw new Error(`Formato de color no compatible: ${color}`);
    }

    const red = rgbaMatch[1];
    const green = rgbaMatch[2];
    const blue = rgbaMatch[3];
    const alphaValue = rgbaMatch[4];

    if (!red || !green || !blue || !alphaValue) {
        throw new Error(`Formato de color incompleto: ${color}`);
    }

    const alpha = Number.parseFloat(alphaValue);
    const background = toRgb(backdrop);
    const foreground = {
        r: Number.parseInt(red, 10) / 255,
        g: Number.parseInt(green, 10) / 255,
        b: Number.parseInt(blue, 10) / 255,
    };

    return {
        r: foreground.r * alpha + background.r * (1 - alpha),
        g: foreground.g * alpha + background.g * (1 - alpha),
        b: foreground.b * alpha + background.b * (1 - alpha),
    };
}

function toLinear(channel: number) {
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function getLuminance(color: string, backdrop?: string) {
    const { r, g, b } = toRgb(color, backdrop);

    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function getContrastRatio(foreground: string, background: string, backdrop?: string) {
    const foregroundLuminance = getLuminance(foreground);
    const backgroundLuminance = getLuminance(background, backdrop);
    const lighter = Math.max(foregroundLuminance, backgroundLuminance);
    const darker = Math.min(foregroundLuminance, backgroundLuminance);

    return (lighter + 0.05) / (darker + 0.05);
}

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

    it("preserva el celeste firma como acción primaria en modo claro", () => {
        const theme = getTheme("light");

        expect(theme.colors.primary).toBe(aqua[300]);
        expect(theme.colors.onPrimary).toBe(ink.onBrand);
    });

    it("mantiene CTAs del hero independientes por fase", () => {
        const themes = [getTheme("light"), getTheme("dark")];

        themes.forEach((theme) => {
            const phaseSolids = PHASE_KEYS.map((phaseKey) => theme.phases[phaseKey].solid);

            expect(new Set(phaseSolids).size).toBe(PHASE_KEYS.length);

            phaseSolids.forEach((solid) => {
                expect(solid).not.toBe(theme.colors.primary);
            });
        });
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

    it("mantiene contraste AA en roles cromáticos críticos", () => {
        const themes = [getTheme("light"), getTheme("dark")];

        themes.forEach((theme) => {
            const semanticPairs = [
                [theme.colors.text, theme.colors.background],
                [theme.colors.textSecondary, theme.colors.background],
                [theme.colors.textMuted, theme.colors.background],
                [theme.colors.textMuted, theme.colors.surface],
                [theme.colors.onPrimary, theme.colors.primary],
                [theme.colors.link, theme.colors.background],
                [theme.colors.link, theme.colors.surface],
                [theme.colors.link, theme.colors.primaryTint, theme.colors.background],
                [theme.colors.link, theme.colors.primarySubtle, theme.colors.background],
                [theme.colors.tabBarActive, theme.colors.tabBarBackground, theme.colors.background],
                [theme.colors.tabBarInactive, theme.colors.tabBarBackground, theme.colors.background],
            ] as const;

            semanticPairs.forEach(([foreground, background, backdrop]) => {
                expect(getContrastRatio(foreground, background, backdrop)).toBeGreaterThanOrEqual(4.5);
            });

            PHASE_KEYS.forEach((phaseKey) => {
                const palette = theme.phases[phaseKey];

                expect(getContrastRatio(palette.onSurface, palette.surface)).toBeGreaterThanOrEqual(4.5);
                expect(getContrastRatio(palette.onSolid, palette.solid)).toBeGreaterThanOrEqual(4.5);
            });
        });
    });
});
