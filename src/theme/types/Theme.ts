import type { ShadowSet } from "./elevation";
import type { Duration, Easings } from "./motion";
import type { BorderWidth, Radius } from "./radii";
import type { Sizing, Space } from "./spacing";
import type { Typography } from "./typography";
import type { PhaseColors, PhaseKey } from "./PhaseColors";
import type { SemanticColors } from "./SemanticColors";

/** Modo de color resuelto (lo que realmente se pinta). Lo decide el sistema. */
export type ColorSchemeMode = "light" | "dark";

/**
 * Tema ensamblado: el objeto único que la UI consume vía `useTheme()` /
 * `createStyles()`. Cada modo (`themes/light.ts`, `themes/dark.ts`) produce un
 * objeto de esta misma forma combinando los tokens crudos (espaciado, tipografía,
 * radios…) con la capa que depende del modo (colores, fases, sombras).
 */
export type Theme = {
    mode: ColorSchemeMode;
    colors: SemanticColors;
    /** Paleta cromática compartida por fase del ciclo. */
    phases: Record<PhaseKey, PhaseColors>;
    spacing: Space;
    radius: Radius;
    borderWidth: BorderWidth;
    sizing: Sizing;
    typography: Typography;
    shadows: ShadowSet;
    motion: { duration: Duration; easing: Easings };
};
