/**
 * Contrato de color semántico: los ROLES que consume la UI.
 *
 * `light.ts` y `dark.ts` implementan exactamente esta forma, así una pantalla
 * nunca conoce el hex: pide `colors.surface`, `colors.textSecondary`, etc. y
 * funciona en ambos modos.
 */
export type SemanticColors = {
    // — Fondos y superficies —
    /** Fondo base de la app (detrás de todo). */
    background: string;
    /** Superficie de tarjetas y hojas. */
    surface: string;
    /** Superficie secundaria / paneles sutiles. */
    surfaceAlt: string;
    /** Superficie hundida (inputs, wells). */
    surfaceSunken: string;
    /** Superficie translúcida sobre fotos/heros (glass). */
    surfaceGlass: string;
    /** Velo para modales / sheets. */
    overlay: string;

    // — Bordes y separadores —
    border: string;
    borderStrong: string;
    /** Separador muy sutil (hairline tintada). */
    divider: string;

    // — Texto —
    /** Texto principal. */
    text: string;
    /** Texto secundario (subtítulos, descripciones). */
    textSecondary: string;
    /** Texto terciario (hints, metadatos). */
    textMuted: string;
    /** Texto sobre superficies de acento muy oscuras/claras (inverso). */
    textInverse: string;
    /** Placeholder de inputs. */
    placeholder: string;

    // — Iconografía —
    icon: string;
    iconStrong: string;

    // — Marca / acción primaria —
    primary: string;
    /** Estado presionado de la acción primaria. */
    primaryPressed: string;
    /** Tinte de fondo para selección/realce (chips activos, filas). */
    primaryTint: string;
    /** Tinte aún más sutil (fondos de sección de marca). */
    primarySubtle: string;
    /** Contenido sobre `primary`. */
    onPrimary: string;
    /** Enlaces y texto de acción sobre superficies claras. */
    link: string;
    /** Anillo de foco/accesibilidad. */
    focusRing: string;

    // — Estados semánticos —
    success: string;
    successText: string;
    successSurface: string;
    warning: string;
    warningText: string;
    warningSurface: string;
    danger: string;
    dangerText: string;
    dangerSurface: string;

    // — Navegación (tab bar / headers) —
    tabBarActive: string;
    tabBarInactive: string;
    tabBarBackground: string;
    tabBarBorder: string;

    // — Utilidad —
    /** Fondo de esqueletos de carga. */
    skeleton: string;
};
