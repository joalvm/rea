import { darkTheme } from "./themes/dark";
import { lightTheme } from "./themes/light";
import type { ColorSchemeMode, Theme } from "./types/Theme";

/**
 * Orquestador del tema. Reúne los temas por modo en un registro (forma estilo
 * Unistyles: `themes.light` / `themes.dark`) y expone `getTheme(mode)` con
 * referencias estables (el mismo objeto por modo).
 */
export const themes = {
    light: lightTheme,
    dark: darkTheme,
} as const;

/** Devuelve el tema completo para el modo dado. */
export function getTheme(mode: ColorSchemeMode): Theme {
    return themes[mode];
}
