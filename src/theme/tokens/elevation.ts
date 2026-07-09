import type { ViewStyle } from "react-native";
import type { ShadowSet } from "../types/elevation";

/**
 * Tokens de elevación / sombra (tokens crudos) — sistema "Rea Soft".
 *
 * La dirección visual es suave y aireada: las sombras existen pero son un
 * SUSURRO (apenas perceptibles). Definen la flotación de una tarjeta o un CTA
 * sobre el lienzo, nunca un drama de profundidad. La jerarquía se apoya sobre
 * todo en superficie + borde fino + ritmo; la sombra solo redondea la sensación.
 *
 *  - `1` = tarjeta en reposo (susurro).
 *  - `2` = elemento que flota un poco más (CTA, hoja).
 *  - `3` = overlay / sheet (reservado).
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

/** Sombras para modo claro. Color base = tinta aqua profunda de Rea. */
export const shadowsLight: ShadowSet = {
    0: {
        shadowColor: "transparent",
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: { width: 0, height: 0 },
        elevation: 0,
    },
    1: { ...ios("#0A3A4A", 0.05, 10, 3), elevation: 1 },
    2: { ...ios("#0A3A4A", 0.08, 18, 6), elevation: 3 },
    3: { ...ios("#0A3A4A", 0.12, 26, 12), elevation: 8 },
};

/** Sombras para modo oscuro: casi imperceptibles (la jerarquía vive en superficie + borde). */
export const shadowsDark: ShadowSet = {
    0: {
        shadowColor: "transparent",
        shadowOpacity: 0,
        shadowRadius: 0,
        shadowOffset: { width: 0, height: 0 },
        elevation: 0,
    },
    1: { ...ios("#000000", 0.22, 10, 3), elevation: 1 },
    2: { ...ios("#000000", 0.3, 18, 6), elevation: 3 },
    3: { ...ios("#000000", 0.4, 26, 12), elevation: 8 },
};
