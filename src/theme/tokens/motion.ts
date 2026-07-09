import { Easing } from "react-native-reanimated";
import type { Duration, Easings } from "../types/motion";

/**
 * Tokens de movimiento (tokens crudos).
 *
 * Duraciones y curvas para que las transiciones (p. ej. el cambio de fase del
 * Hero) se sientan suaves y coherentes en toda la app. Suaves y discretas: la
 * marca es calmada, nada de rebotes bruscos.
 */

/** Duraciones en ms. */
export const duration: Duration = {
    instant: 90,
    fast: 140,
    base: 220,
    slow: 320,
    /** Transición del Hero entre fases (debe notarse pero no distraer). */
    phase: 420,
} as const;

/** Curvas de aceleración. `standard` para la mayoría; `entrance`/`exit` para aparición. */
export const easing: Easings = {
    standard: Easing.bezier(0.2, 0, 0, 1),
    entrance: Easing.out(Easing.cubic),
    exit: Easing.in(Easing.cubic),
};
