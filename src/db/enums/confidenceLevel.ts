/**
 * Niveles ordinales de confianza compartidos entre proyecciones y motores de contenido.
 * Se usan cuando la app necesita expresar cuanta certeza tiene un calculo o recomendacion.
 */
export const confidenceLevelValues = ["low", "medium", "high"] as const;

/**
 * Union literal de niveles de confianza aceptados por el dominio.
 * Importar este tipo cuando una entidad o helper deba restringirse a `confidenceLevelValues`.
 */
export type ConfidenceLevel = (typeof confidenceLevelValues)[number];
