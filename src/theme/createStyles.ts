import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from "react-native";

import type { Theme } from "./types/Theme";
import { useTheme } from "./useTheme";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };
type StylesFactory<T extends NamedStyles<T>> = (theme: Theme) => T;

const stylesCache = new WeakMap<StylesFactory<any>, WeakMap<Theme, any>>();

function getCachedStyles<T extends NamedStyles<T>>(factory: StylesFactory<T>, theme: Theme): T {
    let perThemeCache = stylesCache.get(factory) as WeakMap<Theme, T> | undefined;
    if (!perThemeCache) {
        perThemeCache = new WeakMap<Theme, T>();
        stylesCache.set(factory, perThemeCache);
    }

    const cached = perThemeCache.get(theme);
    if (cached) {
        return cached;
    }

    const styles = StyleSheet.create(factory(theme));
    perThemeCache.set(theme, styles);

    return styles;
}

/**
 * Fábrica de estilos dependientes del tema, al estilo de Unistyles. Recibe
 * `(theme) => estilos` a nivel de módulo y devuelve un HOOK que resuelve el tema
 * actual y reutiliza un `StyleSheet` compartido por factory + tema.
 *
 * Eso evita que cada instancia de componente vuelva a ejecutar
 * `StyleSheet.create(...)` para el mismo tema resuelto. Como `ThemeProvider`
 * expone referencias estables por modo, el caché termina teniendo una entrada
 * por factory en light y otra en dark.
 *
 * ```tsx
 * const useStyles = createStyles((theme) => ({
 *   card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.xl },
 * }));
 *
 * function Card() {
 *   const styles = useStyles();
 *   return <View style={styles.card} />;
 * }
 * ```
 */
export function createStyles<T extends NamedStyles<T>>(factory: StylesFactory<T>): () => T {
    return function useStyles() {
        const theme = useTheme();
        return getCachedStyles(factory, theme);
    };
}
