import type { ColorScale } from "../types/colors";

/**
 * Primitivas de color de Rea.
 *
 * Estos valores no son roles de UI; son la materia prima del tema. Las pantallas
 * deben consumir `theme.colors.*` o `theme.phases.*`, no estas escalas directas.
 *
 * La identidad nace del celeste de marca `aqua.300 = #7CD9F9`. Ese valor es la
 * superficie primaria de marca; cuando el color se usa como texto pequeno, la UI
 * debe bajar a `aqua.700` para mantener contraste.
 */

/** Celeste Rea. `300` conserva el color exacto de marca. */
export const aqua = {
    50: "#F0FCFF",
    100: "#DDF7FE",
    200: "#B9EEFC",
    300: "#7CD9F9",
    400: "#45C8F1",
    500: "#18AEDD",
    600: "#087FA6",
    700: "#076583",
    800: "#0A4F68",
    900: "#083C50",
    950: "#062633",
} as const satisfies ColorScale;

/** Neutros acuosos. Menos slate enterprise, mas Rea: aire, agua, intimidad. */
export const mist = {
    0: "#FFFFFF",
    50: "#F3FAFC",
    100: "#E8F5F9",
    200: "#CFE6EE",
    300: "#A9D2DE",
    400: "#79AABD",
    500: "#4F7482",
    600: "#416878",
    700: "#2C4E5B",
    800: "#1D3A45",
    900: "#102631",
    950: "#07182A",
} as const;

/** Tintas de lectura compartidas entre modo claro y oscuro. */
export const ink = {
    base: mist[900],
    secondary: mist[600],
    muted: mist[500],
    onBrand: aqua[950],
    inverse: mist[0],
    darkBase: "#E9F4FF",
    darkSecondary: "#A6CCE6",
    darkMuted: "#7AA0C2",
} as const;

/** Estados semanticos globales: exito, aviso y peligro. */
export const status = {
    success: {
        surface: "#E8FBF1",
        accent: "#37C989",
        text: "#0E6848",
        darkSurface: "#0A2B20",
        darkAccent: "#57DDA5",
        darkText: "#B8F3D8",
    },
    warning: {
        surface: "#FFF7D7",
        accent: "#F8B633",
        text: "#7A4B00",
        darkSurface: "#342507",
        darkAccent: "#FFD166",
        darkText: "#FFE7A3",
    },
    danger: {
        surface: "#FFF0F5",
        accent: "#EF3F78",
        text: "#8E1E43",
        darkSurface: "#351221",
        darkAccent: "#FF7AA2",
        darkText: "#FFC2D5",
    },
} as const;

/**
 * Colores por fase del ciclo.
 *
 * Todas las fases se sienten de la misma familia que Rea: luminosas, utiles para
 * identificar contexto, pero sin competir con el celeste de marca.
 */
export const phase = {
    unknown: {
        surface: "#EAF8FD",
        accent: "#26BCEB",
        text: "#075E7B",
        muted: "#2D819A",
        darkSurface: "#0A2F3E",
        darkAccent: "#5AD8F8",
        darkText: "#EAFBFF",
        darkMuted: "#9ED4E2",
    },
    menstrual: {
        surface: "#FFF0F5",
        accent: "#EF3F78",
        text: "#8E1E43",
        muted: "#B54168",
        darkSurface: "#351221",
        darkAccent: "#FF7AA2",
        darkText: "#FFEAF1",
        darkMuted: "#F2AFC5",
    },
    follicular: {
        surface: "#E8FBF1",
        accent: "#37C989",
        text: "#0E6848",
        muted: "#338566",
        darkSurface: "#0A2B20",
        darkAccent: "#57DDA5",
        darkText: "#E7FFF3",
        darkMuted: "#A9DFC8",
    },
    fertileWindow: {
        surface: "#FFF7D7",
        accent: "#F8B633",
        text: "#7A4B00",
        muted: "#A16A0A",
        darkSurface: "#342507",
        darkAccent: "#FFD166",
        darkText: "#FFF4CF",
        darkMuted: "#E7CB82",
    },
    estimatedOvulation: {
        surface: "#FFF0EA",
        accent: "#FF765C",
        text: "#A83224",
        muted: "#C65546",
        darkSurface: "#381610",
        darkAccent: "#FF9A83",
        darkText: "#FFEDE7",
        darkMuted: "#E7B1A6",
    },
    luteal: {
        surface: "#F2EEFF",
        accent: "#8F78F2",
        text: "#4C39A5",
        muted: "#6F5BC5",
        darkSurface: "#20183C",
        darkAccent: "#B6A7FF",
        darkText: "#F0ECFF",
        darkMuted: "#C0B6E8",
    },
    pregnancy: {
        surface: "#E6FAF7",
        accent: "#43C8BC",
        text: "#096C65",
        muted: "#2B8880",
        darkSurface: "#092E2B",
        darkAccent: "#69DDD3",
        darkText: "#E6FFFC",
        darkMuted: "#A7DCD7",
    },
} as const;
