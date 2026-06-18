import { amber, mint, neutral, rose, sky } from "../tokens/colors";
import { shadowsLight } from "../tokens/elevation";
import { duration, easing } from "../tokens/motion";
import { borderWidth, radius } from "../tokens/radii";
import { sizing, space } from "../tokens/spacing";
import { typography } from "../tokens/typography";
import type { Theme } from "../types/Theme";

/** Tema claro completo (referencia estable que consume `getTheme`). */
export const lightTheme: Theme = {
    mode: "light",
    colors: {
        background: neutral[50], // #F6F8FB
        surface: neutral[0], // #FFFFFF
        surfaceAlt: neutral[100], // #EEF2F6
        surfaceSunken: neutral[100],
        surfaceGlass: "rgba(255,255,255,0.72)",
        overlay: "rgba(17,23,30,0.45)",

        border: neutral[200], // #DFE6EE
        borderStrong: neutral[300], // #CBD5E1
        divider: "rgba(17,23,30,0.06)",

        text: neutral[900], // #1B232C — 15.9:1
        textSecondary: neutral[600], // #51606E — 6.3:1
        textMuted: neutral[500], // #6B7B8C — 4.3:1
        textInverse: neutral[0],
        placeholder: neutral[400], // #94A2B2

        icon: neutral[500],
        iconStrong: neutral[700],

        primary: sky[600], // #0E89BB
        primaryPressed: sky[700], // #126E95
        primaryTint: sky[100], // #D2F2FC
        primarySubtle: sky[50], // #ECFAFE
        onPrimary: neutral[0],
        link: sky[700], // #126E95 — AA 5.7
        focusRing: sky[400], // #46C4EF

        success: mint[500],
        successText: mint.deep,
        successSurface: mint.tint,
        warning: amber[500],
        warningText: amber.deep,
        warningSurface: amber.tint,
        danger: rose[500],
        dangerText: rose.deep,
        dangerSurface: rose.tint,

        tabBarActive: sky[600],
        tabBarInactive: neutral[400],
        tabBarBackground: "rgba(255,255,255,0.94)",
        tabBarBorder: neutral[200],

        skeleton: neutral[100],
    },
    phases: {
        unknown: {
            surface: "#D8F1FB",
            accent: "#1FA9DC",
            accentSubtle: "rgba(31,169,220,0.22)",
            onSurface: "#155E7C",
            onSurfaceMuted: "#2E7795",
            elevatedSurface: "rgba(255,255,255,0.62)",
            onElevatedSurface: "#155E7C",
            solid: "#FFFFFF",
            onSolid: "#155E7C",
        },
        menstrual: {
            surface: "#FFE3EC",
            accent: "#F2789F",
            accentSubtle: "rgba(242,120,159,0.24)",
            onSurface: "#9D2D55",
            onSurfaceMuted: "#B85A77",
            elevatedSurface: "rgba(255,255,255,0.62)",
            onElevatedSurface: "#9D2D55",
            solid: "#FFFFFF",
            onSolid: "#9D2D55",
        },
        follicular: {
            surface: "#D8F5E8",
            accent: "#2FC18A",
            accentSubtle: "rgba(47,193,138,0.22)",
            onSurface: "#16744F",
            onSurfaceMuted: "#2E8466",
            elevatedSurface: "rgba(255,255,255,0.62)",
            onElevatedSurface: "#16744F",
            solid: "#FFFFFF",
            onSolid: "#16744F",
        },
        fertile_window: {
            surface: "#FFEFD2",
            accent: "#F0A93C",
            accentSubtle: "rgba(240,169,60,0.24)",
            onSurface: "#8A5A0E",
            onSurfaceMuted: "#A0741F",
            elevatedSurface: "rgba(255,255,255,0.62)",
            onElevatedSurface: "#8A5A0E",
            solid: "#FFFFFF",
            onSolid: "#8A5A0E",
        },
        estimated_ovulation: {
            surface: "#FFE2DB",
            accent: "#FF7E6B",
            accentSubtle: "rgba(255,126,107,0.24)",
            onSurface: "#B83A2A",
            onSurfaceMuted: "#C75B4B",
            elevatedSurface: "rgba(255,255,255,0.62)",
            onElevatedSurface: "#B83A2A",
            solid: "#FFFFFF",
            onSolid: "#B83A2A",
        },
        luteal: {
            surface: "#EAE5FC",
            accent: "#9C8CF0",
            accentSubtle: "rgba(156,140,240,0.24)",
            onSurface: "#5341A8",
            onSurfaceMuted: "#6E5EBE",
            elevatedSurface: "rgba(255,255,255,0.62)",
            onElevatedSurface: "#5341A8",
            solid: "#FFFFFF",
            onSolid: "#5341A8",
        },
        pregnancy: {
            surface: "#D6F2EF",
            accent: "#66C7C0",
            accentSubtle: "rgba(102,199,192,0.22)",
            onSurface: "#1F6E68",
            onSurfaceMuted: "#357F79",
            elevatedSurface: "rgba(255,255,255,0.62)",
            onElevatedSurface: "#1F6E68",
            solid: "#FFFFFF",
            onSolid: "#1F6E68",
        },
    },
    spacing: space,
    radius,
    borderWidth,
    sizing,
    typography,
    shadows: shadowsLight,
    motion: { duration, easing },
};
