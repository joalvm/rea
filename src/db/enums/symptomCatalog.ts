/**
 * Grupos semanticos usados para clasificar sintomas en catalogo, UI y analitica.
 * Se usan para organizar sintomas por familia clinica o de experiencia dentro de la app.
 */
export const symptomGroupValues = [
    "pain",
    "digestive",
    "skin",
    "sleep",
    "mood",
    "energy",
    "bleeding",
    "body",
    "sexual_health",
    "other",
] as const;

/**
 * Union literal de grupos validos para clasificar sintomas.
 * Importar este tipo cuando una entidad o componente necesite aceptar solo valores de `symptomGroupValues`.
 */
export type SymptomGroup = (typeof symptomGroupValues)[number];
