import { StyleSheet } from "react-native";
import type { BorderWidth, Radius } from "../types/radii";

/**
 * Tokens de forma: radios de esquina y anchos de borde (tokens crudos).
 *
 * La estética es suave → radios generosos. `borderWidth.hairline` es la línea más
 * fina que puede pintar el dispositivo (1px físico real).
 */

/** Radios de borde. */
export const radius: Radius = {
    none: 0,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    "2xl": 28,
    "3xl": 36,
    pill: 999,
    full: 9999,
} as const;

/** Anchos de borde. `hairline` = línea más fina del dispositivo. */
export const borderWidth: BorderWidth = {
    hairline: StyleSheet.hairlineWidth,
    thin: 1,
    thick: 2,
};
