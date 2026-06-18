import { lightInk, neutral, sky } from "../tokens/colors";
import { shadowsDark } from "../tokens/elevation";
import { space, sizing } from "../tokens/spacing";
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
 * Base azul-negra (no negro puro) para conservar el carácter celeste. La marca se
 * ACLARA (sky.400) para ganar vibración; sobre ella el contenido va en tinta
 * oscura. Contrastes verificados AA — ver docs/DESIGN_SYSTEM.md.
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

        background: "#0E141B",
        surface: "#161E27",
        surfaceAlt: "#1E2832",
        surfaceSunken: "#0B1117",
        surfaceGlass: "rgba(22,30,39,0.66)",
        overlay: "rgba(0,0,0,0.6)",

        border: "#2A3742",
        borderStrong: "#38485A",
        divider: "rgba(255,255,255,0.08)",

        text: lightInk.base, // #E7EDF3 — 14:1 sobre surface
        textSecondary: lightInk.muted, // #9DB0C2 — 7.5:1
        textMuted: lightInk.faint, // #7C8FA1
        textInverse: neutral[900],
        placeholder: "#5C6B7A",

        icon: lightInk.muted,
        iconStrong: lightInk.base,

        primary: sky[400], // #46C4EF — vibrante en oscuro
        primaryPressed: sky[300], // #7CD9F9
        primaryTint: "rgba(70,196,239,0.16)",
        primarySubtle: "rgba(70,196,239,0.10)",
        onPrimary: "#06222F", // tinta oscura sobre primary (AA 7.4)
        link: sky[300], // #7CD9F9
        focusRing: sky[300],

        success: "#3FD7A3",
        successText: "#7FE9C4",
        successSurface: "rgba(47,193,138,0.16)",
        warning: "#F4C264",
        warningText: "#FAD79A",
        warningSurface: "rgba(240,169,60,0.16)",
        danger: "#F87E94",
        dangerText: "#FBA9B7",
        dangerSurface: "rgba(242,96,122,0.16)",

        tabBarActive: sky[300],
        tabBarInactive: "#5C6B7A",
        tabBarBackground: "rgba(14,20,27,0.92)",
        tabBarBorder: "#2A3742",

        skeleton: "#1E2832",
    },
    phases: {
        unknown: {
            ...lightTheme.phases.unknown,
            surface: "#0E2A37",
            accent: "#46C4EF",
            accentSubtle: "rgba(70,196,239,0.20)",
            onSurface: "#E4F4FB",
            onSurfaceMuted: "#A7CBDA",
            elevatedSurface: "rgba(255,255,255,0.10)",
            onElevatedSurface: "#E4F4FB",
            solid: "#46C4EF",
            onSolid: "#06222F",
        },
        menstrual: {
            ...lightTheme.phases.menstrual,
            surface: "#321623",
            accent: "#F58DAC",
            accentSubtle: "rgba(245,141,172,0.18)",
            onSurface: "#FCEAF0",
            onSurfaceMuted: "#D9A7B8",
            elevatedSurface: "rgba(255,255,255,0.10)",
            onElevatedSurface: "#FCEAF0",
            solid: "#F58DAC",
            onSolid: "#3A1622",
        },
        follicular: {
            ...lightTheme.phases.follicular,
            surface: "#102A22",
            accent: "#57D2A2",
            accentSubtle: "rgba(87,210,162,0.18)",
            onSurface: "#E7FAF1",
            onSurfaceMuted: "#A6D8C6",
            elevatedSurface: "rgba(255,255,255,0.10)",
            onElevatedSurface: "#E7FAF1",
            solid: "#57D2A2",
            onSolid: "#0E2A20",
        },
        fertile_window: {
            ...lightTheme.phases.fertile_window,
            surface: "#322411",
            accent: "#F6C56A",
            accentSubtle: "rgba(246,197,106,0.16)",
            onSurface: "#FBF1DD",
            onSurfaceMuted: "#D8C49B",
            elevatedSurface: "rgba(255,255,255,0.10)",
            onElevatedSurface: "#FBF1DD",
            solid: "#F6C56A",
            onSolid: "#2E2009",
        },
        estimated_ovulation: {
            ...lightTheme.phases.estimated_ovulation,
            surface: "#32160F",
            accent: "#FF9E8C",
            accentSubtle: "rgba(255,158,140,0.18)",
            onSurface: "#FCEAE4",
            onSurfaceMuted: "#DBB0A6",
            elevatedSurface: "rgba(255,255,255,0.10)",
            onElevatedSurface: "#FCEAE4",
            solid: "#FF9E8C",
            onSolid: "#34130C",
        },
        luteal: {
            ...lightTheme.phases.luteal,
            surface: "#1F1A38",
            accent: "#B3A6F4",
            accentSubtle: "rgba(179,166,244,0.18)",
            onSurface: "#ECE8FB",
            onSurfaceMuted: "#B9AFE0",
            elevatedSurface: "rgba(255,255,255,0.10)",
            onElevatedSurface: "#ECE8FB",
            solid: "#B3A6F4",
            onSolid: "#221B40",
        },
        pregnancy: {
            ...lightTheme.phases.pregnancy,
            surface: "#0E2C2A",
            accent: "#6FD3CB",
            accentSubtle: "rgba(111,211,203,0.18)",
            onSurface: "#E2F6F4",
            onSurfaceMuted: "#A6D2CD",
            elevatedSurface: "rgba(255,255,255,0.10)",
            onElevatedSurface: "#E2F6F4",
            solid: "#6FD3CB",
            onSolid: "#0A2624",
        },
    },
    spacing: space,
    radius,
    borderWidth,
    sizing,
    typography,
    shadows: shadowsDark,
    motion: { duration, easing },
};
