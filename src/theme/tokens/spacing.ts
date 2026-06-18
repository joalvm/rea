import { Sizing, Space } from "../types/spacing";

/**
 * Tokens de espaciado y tamaños (tokens crudos).
 *
 * Escala de espaciado en base 4 (sistema de 4pt) para un ritmo vertical y
 * horizontal consistente. Usa siempre estos tokens en vez de números mágicos.
 * `sizing` agrupa medidas de elementos comunes (controles, iconos, áreas táctiles).
 */
export const space: Space = {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 24,
    "3xl": 32,
    "4xl": 40,
    "5xl": 48,
    "6xl": 64,
};

export const sizing: Sizing = {
    controlSm: 40,
    controlMd: 48,
    controlLg: 56,
    /** Área táctil mínima recomendada (iOS HIG / Material). */
    minTouch: 44,
    iconXs: 16,
    iconSm: 18,
    iconMd: 22,
    iconLg: 28,
    iconXl: 36,
    /** Altura nominal de la barra de pestañas (sin safe-area). */
    tabBar: 60,
    /** Ancho máximo de columna de lectura para textos largos. */
    readableMaxWidth: 360,
};
