import { Platform } from "react-native";
import type { Typography } from "../types/typography";

/**
 * Tokens de tipografía (tokens crudos).
 *
 * No se empaquetan fuentes propias: usamos la fuente de sistema (San Francisco
 * en iOS, Roboto en Android) por rendimiento, legibilidad nativa y porque
 * mantiene la app 100% compatible con Expo Go sin assets extra.
 *
 * La estética "suave/juvenil" se logra con pesos medios, interlineado generoso
 * y un leve `letterSpacing` negativo en titulares. Si en el futuro se quiere una
 * tipografía redondeada de marca (Nunito / Quicksand vía @expo-google-fonts),
 * basta con cambiar `families` aquí. Ver docs/DESIGN_SYSTEM.md → Tipografía.
 */

/** Familia de sistema. `undefined` deja que RN use la fuente nativa por defecto. */
const systemFamily = Platform.select({ ios: undefined, android: undefined, default: undefined });

export const fontFamilies: Typography["families"] = {
    /** Cuerpo y UI. */
    sans: systemFamily,
    /** Titulares (mismo sistema; separado para poder cambiarlo sin tocar variantes). */
    heading: systemFamily,
    /** Números tabulares / datos (monoespaciada del sistema). */
    mono: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
};

/** Pesos como literales válidos para `fontWeight` de React Native. */
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
            fontFamily: fontFamilies.heading,
            fontSize: fontSizes.display,
            lineHeight: 40,
            fontWeight: fontWeights.bold,
            letterSpacing: -0.5,
        },
        h1: {
            fontFamily: fontFamilies.heading,
            fontSize: fontSizes.h1,
            lineHeight: 34,
            fontWeight: fontWeights.bold,
            letterSpacing: -0.4,
        },
        h2: {
            fontFamily: fontFamilies.heading,
            fontSize: fontSizes.h2,
            lineHeight: 28,
            fontWeight: fontWeights.bold,
            letterSpacing: -0.2,
        },
        h3: {
            fontFamily: fontFamilies.heading,
            fontSize: fontSizes.h3,
            lineHeight: 24,
            fontWeight: fontWeights.semibold,
            letterSpacing: -0.1,
        },
        title: {
            fontFamily: fontFamilies.sans,
            fontSize: fontSizes.title,
            lineHeight: 22,
            fontWeight: fontWeights.semibold,
        },
        body: {
            fontFamily: fontFamilies.sans,
            fontSize: fontSizes.body,
            lineHeight: 24,
            fontWeight: fontWeights.regular,
        },
        bodyStrong: {
            fontFamily: fontFamilies.sans,
            fontSize: fontSizes.body,
            lineHeight: 24,
            fontWeight: fontWeights.semibold,
        },
        callout: {
            fontFamily: fontFamilies.sans,
            fontSize: fontSizes.callout,
            lineHeight: 21,
            fontWeight: fontWeights.regular,
        },
        subhead: {
            fontFamily: fontFamilies.sans,
            fontSize: fontSizes.subhead,
            lineHeight: 20,
            fontWeight: fontWeights.medium,
        },
        footnote: {
            fontFamily: fontFamilies.sans,
            fontSize: fontSizes.footnote,
            lineHeight: 18,
            fontWeight: fontWeights.regular,
        },
        caption: {
            fontFamily: fontFamilies.sans,
            fontSize: fontSizes.caption,
            lineHeight: 16,
            fontWeight: fontWeights.medium,
        },
        overline: {
            fontFamily: fontFamilies.sans,
            fontSize: fontSizes.overline,
            lineHeight: 14,
            fontWeight: fontWeights.bold,
            letterSpacing: 1.2,
            textTransform: "uppercase",
        },
    },
};
