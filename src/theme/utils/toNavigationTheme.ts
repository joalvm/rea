import { DarkTheme as NavDark, DefaultTheme as NavLight } from "expo-router";

import type { Theme } from "../types/Theme";

const navigationThemeCache = new WeakMap<Theme, ReactNavigation.Theme>();

/**
 * Adapta nuestro tema al formato de React Navigation (vía expo-router) para que
 * headers, fondos y la tab bar tomen automáticamente nuestros colores. Se spreadea
 * el tema base (que ya trae la forma `fonts` que exige React Navigation 7) y solo
 * se sobrescriben los colores. El resultado se cachea por tema resuelto para que
 * navegación reciba una referencia estable mientras siga en el mismo modo.
 */
export function toNavigationTheme(theme: Theme): ReactNavigation.Theme {
    const cached = navigationThemeCache.get(theme);
    if (cached) {
        return cached;
    }

    const base = theme.mode === "dark" ? NavDark : NavLight;
    const navigationTheme: ReactNavigation.Theme = {
        ...base,
        dark: theme.mode === "dark",
        colors: {
            ...base.colors,
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.surface,
            text: theme.colors.text,
            border: theme.colors.border,
            notification: theme.colors.danger,
        },
    };

    navigationThemeCache.set(theme, navigationTheme);

    return navigationTheme;
}
