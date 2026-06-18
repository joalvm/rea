import type { ViewStyle } from "react-native";
import type { ShadowSet } from "../types/elevation";

/**
 * Tokens de elevación / sombra (tokens crudos).
 *
 * En claro usamos sombras suaves y difusas (estética "soft"). En oscuro las
 * sombras casi no se ven, así que la jerarquía se apoya en superficies más
 * claras y bordes; las sombras se reducen para evitar halos sucios.
 *
 * Cada nivel combina las props de iOS (`shadow*`) con `elevation` de Android.
 */

function ios(color: string, opacity: number, radius: number, y: number): ViewStyle {
    return {
        shadowColor: color,
        shadowOpacity: opacity,
        shadowRadius: radius,
        shadowOffset: { width: 0, height: y },
    };
}

/** Sombras para modo claro. Color base = azul-tinta para que no se vean "sucias". */
export const shadowsLight: ShadowSet = {
    0: {
        shadowColor: "transparent",
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: { width: 0, height: 0 },
        elevation: 0,
    },
    1: { ...ios("#1B2A3A", 0.06, 8, 2), elevation: 1 },
    2: { ...ios("#1B2A3A", 0.1, 16, 6), elevation: 3 },
    3: { ...ios("#1B2A3A", 0.14, 28, 12), elevation: 8 },
};

/** Sombras para modo oscuro: más profundas pero muy sutiles. */
export const shadowsDark: ShadowSet = {
    0: {
        shadowColor: "transparent",
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: { width: 0, height: 0 },
        elevation: 0,
    },
    1: { ...ios("#000000", 0.3, 8, 2), elevation: 1 },
    2: { ...ios("#000000", 0.4, 16, 6), elevation: 3 },
    3: { ...ios("#000000", 0.5, 28, 12), elevation: 8 },
};
