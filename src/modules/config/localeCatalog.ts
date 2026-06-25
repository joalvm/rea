/**
 * Idiomas que entiende Rea. Única fuente de verdad.
 *
 * El idioma se toma del sistema (Android/iOS): no hay selector dentro de la app.
 * El regionalismo de formato (Perú → soles, separadores, fechas) se resuelve en
 * `modules/l10n`, no aquí.
 *
 * Carpetas en `src/lang/`: una por idioma soportado (`es`). Para añadir un idioma:
 * crea `src/lang/<idioma>/`, añádelo a `SUPPORTED_LANGUAGES` y regístralo en
 * `modules/i18n/resources.ts`.
 */

/** Idioma de respaldo cuando el sistema no usa uno soportado. */
export const FALLBACK_LANGUAGE = "es";

/** Idiomas soportados (cada uno con su carpeta en `src/lang/`). */
export const SUPPORTED_LANGUAGES = ["es"] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
