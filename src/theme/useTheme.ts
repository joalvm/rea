import { useContext } from "react";

import { ThemeContext } from "./ThemeProvider";
import type { Theme } from "./types/Theme";

/**
 * Hook de consumo del tema. Da el tema ya resuelto a claro/oscuro. Úsalo para
 * valores sueltos (p. ej. el color de un icono que va por prop); para estilos
 * derivados del tema usa `createStyles`.
 *
 * ```tsx
 * const theme = useTheme();
 * <Icon color={theme.colors.icon} />
 * ```
 */
export function useTheme(): Theme {
    const theme = useContext(ThemeContext);
    if (theme === null) {
        throw new Error("useTheme debe usarse dentro de <ThemeProvider>.");
    }
    return theme;
}
