/**
 * Namespaces de traducción. Cada uno es un JSON por idioma en
 * `src/lang/<idioma>/<namespace>.json`. i18next carga estos `ns`; el tipado de
 * claves vive en la augmentación de `i18next` (`modules/i18n/i18next.d.ts`).
 */
export const NAMESPACES = ["today", "onboarding"] as const;

export type Namespace = (typeof NAMESPACES)[number];
