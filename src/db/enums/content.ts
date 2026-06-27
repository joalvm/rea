/**
 * Tipos funcionales de piezas de contenido servidas por el motor editorial.
 * Se usan para distinguir tips, trivias, recomendaciones, contenido educativo y alertas.
 */
export const contentTypeValues = ["tip", "trivia", "recommendation", "educational", "alert"] as const;

/**
 * Origen editorial o cientifico admitido para una fuente de contenido.
 * Sirve para persistir la procedencia y ajustar la confianza o presentacion de la referencia.
 */
export const contentSourceTypeValues = [
    "medical_guideline",
    "government_health",
    "peer_reviewed",
    "clinical_education",
    "book",
    "other",
] as const;

/**
 * Superficies de la app donde un contenido puede mostrarse o registrarse como entregado.
 * Se usa en reglas de distribucion y en el log de delivery para saber donde aparecio un item.
 */
export const contentSurfaceValues = ["today", "day_detail", "statistics"] as const;

/**
 * Disparadores soportados por el motor de reglas de contenido.
 * Cada valor representa la dimension del dominio que debe evaluarse antes de mostrar un item.
 */
export const contentRuleTriggerTypeValues = [
    "phase",
    "symptom",
    "metric_threshold",
    "reproductive_intent",
    "contraception",
    "pregnancy_week",
    "general",
] as const;

/**
 * Union literal de tipos de contenido admitidos por el motor editorial.
 * Importar este tipo cuando una API o entidad necesite aceptar exactamente un valor de `contentTypeValues`.
 */
export type ContentType = (typeof contentTypeValues)[number];

/**
 * Union literal del tipo de fuente permitido para respaldar una pieza de contenido.
 * Importar este tipo cuando se modele la procedencia persistida en `content_sources`.
 */
export type ContentSourceType = (typeof contentSourceTypeValues)[number];

/**
 * Union literal de superficies validas para mostrar o registrar contenido.
 * Importar este tipo cuando un flujo dependa de los destinos definidos en `contentSurfaceValues`.
 */
export type ContentSurface = (typeof contentSurfaceValues)[number];

/**
 * Union literal de disparadores permitidos por las reglas de contenido.
 * Importar este tipo cuando una regla, helper o evaluador deba restringirse a `contentRuleTriggerTypeValues`.
 */
export type ContentRuleTriggerType = (typeof contentRuleTriggerTypeValues)[number];
