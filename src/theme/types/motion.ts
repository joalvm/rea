import { Easing } from "react-native-reanimated";

/** Duraciones de animación en ms. */
export type Duration = {
    instant: number;
    fast: number;
    base: number;
    slow: number;
    phase: number;
};

/** Curvas de aceleración reutilizables en tema. */
type EasingFactory = ReturnType<typeof Easing.bezier>;
type EasingFunction = ReturnType<typeof Easing.out>;

export type Easings = {
    standard: EasingFactory;
    entrance: EasingFunction;
    exit: EasingFunction;
};
