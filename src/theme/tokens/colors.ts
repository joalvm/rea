import type { ColorScale } from "../types/colors";

/**
 * Primitivas de color (tokens crudos).
 *
 * Aquí NO hay semántica: solo escalas de color con sus valores hex. Ninguna
 * pantalla debería importar este archivo directamente; consume siempre los
 * tokens semánticos (`theme.colors.*`) que mapean estas primitivas a un rol.
 *
 * Escalas tonales 50→950 al estilo de sistemas profesionales (Radix / Tailwind):
 * 50–200 = fondos y tintes suaves · 300–400 = decorativos · 500–700 = acción y
 * texto sobre claro · 800–950 = texto y superficies profundas.
 *
 * Color de marca elegido por la usuaria: #7CD9F9 (celeste). Se conserva exacto
 * en `sky.300` como firma visual; la acción interactiva usa tonos más profundos
 * (`sky.600/700`) para cumplir contraste AA. Ver docs/DESIGN_SYSTEM.md.
 */

/** Marca "Sky" / celeste. Hue ~196°, anclada en 300 = #7CD9F9 (color de la usuaria). */
export const sky = {
    50: "#ECFAFE",
    100: "#D2F2FC",
    200: "#A9E6FA",
    300: "#7CD9F9", // ← celeste de marca (exacto, elegido por la usuaria)
    400: "#46C4EF",
    500: "#1FA9DC",
    600: "#0E89BB", // acción primaria (white-on = 3.95, AA para texto grande/UI)
    700: "#126E95", // texto/enlace sobre claro (AA 5.69)
    800: "#165978",
    900: "#174A63",
    950: "#0E2D3D",
} as const satisfies ColorScale;

/** Neutros fríos (slate con leve tinte azul) para armonizar con el celeste. */
export const neutral = {
    0: "#FFFFFF",
    50: "#F6F8FB",
    100: "#EEF2F6",
    200: "#DFE6EE",
    300: "#CBD5E1",
    400: "#94A2B2",
    500: "#6B7B8C",
    600: "#51606E",
    700: "#3A4654",
    800: "#28323D",
    900: "#1B232C",
    950: "#11171E",
} as const;

/** Texto claro para modo oscuro (cálido para reducir fatiga visual). */
export const lightInk = {
    base: "#E7EDF3",
    muted: "#9DB0C2",
    faint: "#7C8FA1",
} as const;

/** Verde menta — éxito / confirmaciones. */
export const mint = {
    tint: "#D8F5E8",
    400: "#5BD1A0",
    500: "#2FC18A",
    deep: "#16744F",
    darkTint: "#123227",
} as const;

/** Ámbar cálido — avisos suaves (nunca alarmista). */
export const amber = {
    tint: "#FFEFD2",
    400: "#F6C56A",
    500: "#F0A93C",
    deep: "#8A5A0E",
    darkTint: "#3A2A10",
} as const;

/** Rosa — error / destructivo, en tono suave. */
export const rose = {
    tint: "#FFE1E7",
    400: "#F58399",
    500: "#F2607A",
    deep: "#B23250",
    darkTint: "#3D1A24",
} as const;
