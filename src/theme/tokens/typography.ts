import { Platform } from "react-native";
import type { Typography } from "../types/typography";

/**
 * Tokens de tipografía (tokens crudos) — sistema "Rea Soft".
 *
 * Dos fuentes redondeadas de marca, cargadas vía `@expo-google-fonts` (compatibles
 * con Expo Go) en el layout raíz (`src/app/_layout.tsx`):
 *  - Quicksand   → display y títulos (redondeada geométrica, calma, firma wellness).
 *  - Nunito Sans → cuerpo y UI (redondeada humanista, muy legible a tamaño pequeño).
 *
 * IMPORTANTE (RN): las fuentes estáticas NO responden a `fontWeight`; cada peso es
 * su propia familia. Por eso cada variante fija `fontFamily` al peso concreto y no
 * usa `fontWeight`. El mapa `weights` se conserva para texto en fuente de sistema
 * (p. ej. labels de la tab bar). Ver docs/design/typography.html → Tipografía.
 */

/** Familias por peso. Nombres exactos exportados por `@expo-google-fonts`. */
const heading = {
    semibold: "Quicksand_600SemiBold",
    bold: "Quicksand_700Bold",
} as const;

const body = {
    regular: "NunitoSans_400Regular",
    medium: "NunitoSans_500Medium",
    semibold: "NunitoSans_600SemiBold",
    bold: "NunitoSans_700Bold",
} as const;

export const fontFamilies: Typography["families"] = {
    /** Cuerpo y UI. */
    sans: body.regular,
    /** Titulares. */
    heading: heading.bold,
    /** Números tabulares / datos (monoespaciada del sistema). */
    mono: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
};

/** Pesos para texto en fuente de sistema (la marca usa familias por peso). */
export const fontWeights: Typography["weights"] = {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
};

/** Escala de tamaños (px). */
export const fontSizes: Typography["sizes"] = {
    display: 34,
    h1: 28,
    h2: 22,
    h3: 18,
    title: 17,
    body: 16,
    callout: 15,
    subhead: 14,
    footnote: 13,
    caption: 12,
    overline: 11,
};

export const typography: Typography = {
    families: fontFamilies,
    weights: fontWeights,
    sizes: fontSizes,
    variant: {
        display: {
            fontFamily: heading.bold,
            fontSize: fontSizes.display,
            lineHeight: 40,
            letterSpacing: -0.5,
        },
        h1: {
            fontFamily: heading.bold,
            fontSize: fontSizes.h1,
            lineHeight: 34,
            letterSpacing: -0.4,
        },
        h2: {
            fontFamily: heading.bold,
            fontSize: fontSizes.h2,
            lineHeight: 28,
            letterSpacing: -0.2,
        },
        h3: {
            fontFamily: heading.semibold,
            fontSize: fontSizes.h3,
            lineHeight: 24,
            letterSpacing: -0.1,
        },
        title: {
            fontFamily: body.semibold,
            fontSize: fontSizes.title,
            lineHeight: 22,
        },
        body: {
            fontFamily: body.regular,
            fontSize: fontSizes.body,
            lineHeight: 24,
        },
        bodyStrong: {
            fontFamily: body.semibold,
            fontSize: fontSizes.body,
            lineHeight: 24,
        },
        callout: {
            fontFamily: body.regular,
            fontSize: fontSizes.callout,
            lineHeight: 21,
        },
        subhead: {
            fontFamily: body.medium,
            fontSize: fontSizes.subhead,
            lineHeight: 20,
        },
        footnote: {
            fontFamily: body.regular,
            fontSize: fontSizes.footnote,
            lineHeight: 18,
        },
        caption: {
            fontFamily: body.medium,
            fontSize: fontSizes.caption,
            lineHeight: 16,
        },
        overline: {
            fontFamily: body.bold,
            fontSize: fontSizes.overline,
            lineHeight: 14,
            letterSpacing: 1.2,
            textTransform: "uppercase",
        },
    },
};
