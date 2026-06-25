/**
 * Identidad cromática de las fases del ciclo.
 *
 * El Hero del Home cambia de color según la fase para que la usuaria sepa "de un
 * vistazo, por el color" en qué fase está. Aquí va SOLO color: la copia (nombre,
 * microcopy) y el icono de cada fase son presentación del feature, no del tema
 * (ver `src/features/today/phaseIcons.ts`).
 *
 * Las claves reflejan `daily_summary.estimated_phase` y añaden `pregnancy` para
 * el modo embarazo (predicciones en pausa).
 */

/** Claves de fase, en orden natural del ciclo. Fuente de verdad del tipo `PhaseKey`. */
export const PHASE_KEYS = [
    "unknown",
    "menstrual",
    "follicular",
    "fertile_window",
    "estimated_ovulation",
    "luteal",
    "pregnancy",
] as const;

export type PhaseKey = (typeof PHASE_KEYS)[number];

/** Paleta cromática compartida por fase. Mismas llaves en claro y oscuro. */
export type PhaseColors = {
    /** Superficie principal de la fase. */
    surface: string;
    /** Acento principal de la fase (iconos, detalles, series, marcas). */
    accent: string;
    /** Variante suave/translúcida del acento para capas sutiles. */
    accentSubtle: string;
    /** Contenido principal sobre `surface`. */
    onSurface: string;
    /** Contenido secundario sobre `surface`. */
    onSurfaceMuted: string;
    /** Superficie elevada dentro del contexto de fase (chips, pills, badges). */
    elevatedSurface: string;
    /** Contenido sobre `elevatedSurface`. */
    onElevatedSurface: string;
    /** Superficie sólida de énfasis dentro de la fase (CTA, highlight fuerte). */
    solid: string;
    /** Contenido sobre `solid`. */
    onSolid: string;
};
