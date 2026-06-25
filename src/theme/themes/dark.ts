import { aqua, ink, mist, phase, status } from "../tokens/colors";
import { shadowsDark } from "../tokens/elevation";
import { space, sizing } from "../tokens/spacing";
import { state } from "../tokens/state";
import type { Theme } from "../types/Theme";
import { lightTheme } from "./light";
import { duration, easing } from "../tokens/motion";
import { borderWidth, radius } from "../tokens/radii";
import { typography } from "../tokens/typography";

/**
 * MODO OSCURO = overrides sobre el claro (modelo tipo Tailwind).
 *
 * Se parte de `lightTheme` y se redefine solo lo que cambia. El spread garantiza
 * además que, si el contrato crece con una llave nueva, el oscuro hereda un valor
 * válido por defecto en lugar de quedar incompleto.
 *
 * Base aqua-negra (no negro puro) para conservar el caracter celeste. La marca
 * sube a aqua.400/300 en superficies oscuras, con tinta profunda encima cuando
 * se usa como boton solido.
 */

/**
 * Paleta cromática de fase (oscuro): superficie profunda por fase + acento +
 * roles de contenido y superficies derivadas. Cada fase parte de su versión
 * clara (`lightTheme.phases`) y sobrescribe.
 */

/** Tema oscuro completo = claro + overrides (referencia estable). */
export const darkTheme: Theme = {
    mode: "dark",
    colors: {
        ...lightTheme.colors,

        background: mist[950],
        surface: "#0E2740",
        surfaceAlt: "#16314F",
        surfaceSunken: "#051324",
        surfaceGlass: "rgba(14,39,64,0.72)",
        overlay: "rgba(4,12,24,0.6)",

        border: "#28567A",
        borderStrong: "#3A6E99",
        divider: "rgba(255,255,255,0.08)",

        text: ink.darkBase,
        textSecondary: ink.darkSecondary,
        textMuted: ink.darkMuted,
        textInverse: mist[900],
        placeholder: ink.darkMuted,

        icon: ink.darkSecondary,
        iconStrong: ink.darkBase,

        primary: aqua[400],
        primaryPressed: aqua[300],
        primaryTint: "rgba(124,217,249,0.22)",
        primarySubtle: "rgba(124,217,249,0.13)",
        onPrimary: ink.onBrand,
        link: aqua[300],
        focusRing: aqua[300],

        success: status.success.darkAccent,
        successText: status.success.darkText,
        successSurface: status.success.darkSurface,
        warning: status.warning.darkAccent,
        warningText: status.warning.darkText,
        warningSurface: status.warning.darkSurface,
        danger: status.danger.darkAccent,
        dangerText: status.danger.darkText,
        dangerSurface: status.danger.darkSurface,

        tabBarActive: aqua[300],
        tabBarInactive: ink.darkMuted,
        tabBarBackground: "rgba(7,24,42,0.94)",
        tabBarBorder: "#28567A",

        skeleton: "#1A3553",
    },
    phases: {
        unknown: {
            ...lightTheme.phases.unknown,
            surface: phase.unknown.darkSurface,
            accent: phase.unknown.darkAccent,
            accentSubtle: "rgba(90,216,248,0.20)",
            onSurface: phase.unknown.darkText,
            onSurfaceMuted: phase.unknown.darkMuted,
            elevatedSurface: "rgba(255,255,255,0.10)",
            onElevatedSurface: phase.unknown.darkText,
            solid: phase.unknown.darkAccent,
            onSolid: ink.onBrand,
        },
        menstrual: {
            ...lightTheme.phases.menstrual,
            surface: phase.menstrual.darkSurface,
            accent: phase.menstrual.darkAccent,
            accentSubtle: "rgba(255,122,162,0.18)",
            onSurface: phase.menstrual.darkText,
            onSurfaceMuted: phase.menstrual.darkMuted,
            elevatedSurface: "rgba(255,255,255,0.10)",
            onElevatedSurface: phase.menstrual.darkText,
            solid: phase.menstrual.darkAccent,
            onSolid: ink.onBrand,
        },
        follicular: {
            ...lightTheme.phases.follicular,
            surface: phase.follicular.darkSurface,
            accent: phase.follicular.darkAccent,
            accentSubtle: "rgba(87,221,165,0.18)",
            onSurface: phase.follicular.darkText,
            onSurfaceMuted: phase.follicular.darkMuted,
            elevatedSurface: "rgba(255,255,255,0.10)",
            onElevatedSurface: phase.follicular.darkText,
            solid: phase.follicular.darkAccent,
            onSolid: ink.onBrand,
        },
        fertile_window: {
            ...lightTheme.phases.fertile_window,
            surface: phase.fertileWindow.darkSurface,
            accent: phase.fertileWindow.darkAccent,
            accentSubtle: "rgba(255,209,102,0.16)",
            onSurface: phase.fertileWindow.darkText,
            onSurfaceMuted: phase.fertileWindow.darkMuted,
            elevatedSurface: "rgba(255,255,255,0.10)",
            onElevatedSurface: phase.fertileWindow.darkText,
            solid: phase.fertileWindow.darkAccent,
            onSolid: ink.onBrand,
        },
        estimated_ovulation: {
            ...lightTheme.phases.estimated_ovulation,
            surface: phase.estimatedOvulation.darkSurface,
            accent: phase.estimatedOvulation.darkAccent,
            accentSubtle: "rgba(255,154,131,0.18)",
            onSurface: phase.estimatedOvulation.darkText,
            onSurfaceMuted: phase.estimatedOvulation.darkMuted,
            elevatedSurface: "rgba(255,255,255,0.10)",
            onElevatedSurface: phase.estimatedOvulation.darkText,
            solid: phase.estimatedOvulation.darkAccent,
            onSolid: ink.onBrand,
        },
        luteal: {
            ...lightTheme.phases.luteal,
            surface: phase.luteal.darkSurface,
            accent: phase.luteal.darkAccent,
            accentSubtle: "rgba(182,167,255,0.18)",
            onSurface: phase.luteal.darkText,
            onSurfaceMuted: phase.luteal.darkMuted,
            elevatedSurface: "rgba(255,255,255,0.10)",
            onElevatedSurface: phase.luteal.darkText,
            solid: phase.luteal.darkAccent,
            onSolid: ink.onBrand,
        },
        pregnancy: {
            ...lightTheme.phases.pregnancy,
            surface: phase.pregnancy.darkSurface,
            accent: phase.pregnancy.darkAccent,
            accentSubtle: "rgba(105,221,211,0.18)",
            onSurface: phase.pregnancy.darkText,
            onSurfaceMuted: phase.pregnancy.darkMuted,
            elevatedSurface: "rgba(255,255,255,0.10)",
            onElevatedSurface: phase.pregnancy.darkText,
            solid: phase.pregnancy.darkAccent,
            onSolid: ink.onBrand,
        },
    },
    spacing: space,
    radius,
    borderWidth,
    sizing,
    typography,
    shadows: shadowsDark,
    motion: { duration, easing },
    state,
};
