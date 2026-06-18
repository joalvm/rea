import { createContext, type PropsWithChildren, useEffect } from "react";
import * as SystemUI from "expo-system-ui";
import { useColorScheme } from "react-native";
import { ThemeProvider as NavThemeProvider } from "expo-router";

import { getTheme } from "./theme";
import type { Theme } from "./types/Theme";
import { toNavigationTheme } from "./utils/toNavigationTheme";

/**
 * Contexto del tema. Guarda solo el tema ya resuelto: en esta app móvil el modo
 * lo decide el sistema (no hay selector de tema), así que no hay preferencia que
 * exponer. El contexto vive junto al provider; el hook de consumo está en
 * `useTheme.ts` y la fábrica de estilos en `createStyles.ts`.
 */
export const ThemeContext = createContext<Theme | null>(null);
ThemeContext.displayName = "ThemeContext";

/**
 * Proveedor de tema. Resuelve claro/oscuro desde el esquema del sistema
 * (`useColorScheme`, que re-renderiza al cambiar la apariencia del dispositivo) y
 * envuelve la navegación con el tema de React Navigation para que headers, fondos
 * y la tab bar queden coherentes. Va por encima de toda la app (`src/app/_layout.tsx`).
 */
export function ThemeProvider({ children }: PropsWithChildren) {
    const scheme = useColorScheme();
    const theme = getTheme(scheme === "dark" ? "dark" : "light");
    const navigationTheme = toNavigationTheme(theme);

    useEffect(() => {
        void SystemUI.setBackgroundColorAsync(theme.colors.background);
    }, [theme.colors.background]);

    return (
        <ThemeContext.Provider value={theme}>
            <NavThemeProvider value={navigationTheme}>{children}</NavThemeProvider>
        </ThemeContext.Provider>
    );
}
