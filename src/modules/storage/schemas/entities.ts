/** Entero SQLite usado para valores booleanos persistidos. */
export type SqliteBoolean = 0 | 1;

/** UUIDv7 generado en cliente para entidades locales nuevas. */
export type UuidV7 = string;

/** Timestamp ISO 8601 en UTC. */
export type IsoTimestamp = string;

/** Fecha local con formato YYYY-MM-DD. */
export type IsoLocalDate = string;

/** Regularidad declarada por la usuaria en contexto reproductivo. */
export type ReproductiveRegularity = "regular" | "variable" | "irregular";

/** Estado operacional de un bloque de menstruacion. */
export type PeriodRunStatus = "open" | "closed" | "excluded";

/** Origen del bloque menstrual: confirmado, inferido por sangrado o mixto. */
export type PeriodRunSource = "user_confirmed" | "bleeding_inferred" | "mixed";

/** Grupo estable para ordenar sintomas sin depender de copy visible. */
export type SymptomGroupKey =
    | "pain"
    | "digestive"
    | "skin"
    | "sleep"
    | "mood"
    | "energy"
    | "bleeding"
    | "body"
    | "sexual_health"
    | "other";

/** Señal explicita sobre inicio, fin o continuidad de periodo desde check-in. */
export type PeriodStatusSignal = "started" | "ended" | "ongoing";

/** Base que explica por que un dia cuenta como menstruacion. */
export type MenstruationBasis = "none" | "confirmed_period" | "inferred_bleeding";

/** Fase menstrual estimada o desconocida para read models. */
export type EstimatedPhase =
    | "unknown"
    | "menstrual"
    | "follicular"
    | "fertile_window"
    | "estimated_ovulation"
    | "luteal";

/** Fuente de fase usada para distinguir observado, estimado y desconocido. */
export type PhaseSource = "observed" | "estimated" | "unknown";

/** Confianza del calculo usado por contenido y UI. */
export type PhaseConfidence = "low" | "medium" | "high";

/** Tipo editorial permitido para acompanamiento educativo local. */
export type ContentType = "tip" | "trivia" | "recommendation" | "educational" | "alert";

/** Tipo de fuente usada para auditar contenido editorial. */
export type ContentSourceType =
    | "medical_guideline"
    | "government_health"
    | "peer_reviewed"
    | "clinical_education"
    | "book"
    | "other";

/** Dimension estructurada que activa contenido editorial. */
export type ContentTriggerType =
    | "phase"
    | "symptom"
    | "metric_threshold"
    | "reproductive_intent"
    | "contraception"
    | "general";

/** Superficie donde Rea puede mostrar contenido editorial. */
export type ContentSurface = "today" | "day_detail" | "statistics";

/** Fila de schema_migrations para versionar la base local. */
export interface SchemaMigrationEntity {
    version: number;
    name: string;
    applied_at: IsoTimestamp;
}

/** Perfil local unico con preferencias minimas de recordatorios. */
export interface UserProfileEntity {
    id: UuidV7;
    reminders_enabled: SqliteBoolean;
    reminder_interval_hours: number;
    reminder_window_start: string;
    reminder_window_end: string;
    created_at: IsoTimestamp;
    updated_at: IsoTimestamp;
    version: number;
}

/** Contexto reproductivo historico valido por intervalo de fechas. */
export interface ReproductiveIntentEntity {
    id: UuidV7;
    user_id: UuidV7;
    effective_from: IsoLocalDate;
    effective_to: IsoLocalDate | null;
    regularity: ReproductiveRegularity;
    trying_to_conceive: SqliteBoolean;
    hormonal_contraception: SqliteBoolean;
    declared_cycle_length: number;
    declared_period_length: number;
    created_at: IsoTimestamp;
    updated_at: IsoTimestamp;
    deleted_at: IsoTimestamp | null;
    version: number;
}

/** Bloque continuo de menstruacion confirmado, inferido o mixto. */
export interface PeriodRunEntity {
    id: UuidV7;
    user_id: UuidV7;
    start_date: IsoLocalDate;
    end_date: IsoLocalDate | null;
    status: PeriodRunStatus;
    source: PeriodRunSource;
    created_at: IsoTimestamp;
    updated_at: IsoTimestamp;
    deleted_at: IsoTimestamp | null;
    version: number;
}

/** Sintoma tecnico con clave de traduccion separada del esquema. */
export interface SymptomCatalogEntity {
    symptom_key: string;
    group_key: SymptomGroupKey;
    label_key: string;
    ui_priority: number;
    is_quick_option: SqliteBoolean;
    is_active: SqliteBoolean;
    created_at: IsoTimestamp;
    updated_at: IsoTimestamp;
}

/** Medicacion personalizada de usuaria, deduplicada por nombre normalizado activo. */
export interface MedicationCatalogEntity {
    id: UuidV7;
    user_id: UuidV7;
    name: string;
    normalized_name: string;
    created_at: IsoTimestamp;
    updated_at: IsoTimestamp;
    deleted_at: IsoTimestamp | null;
    version: number;
}

/** Evento canonico registrado por la usuaria en un momento concreto. */
export interface CheckInEntity {
    id: UuidV7;
    user_id: UuidV7;
    recorded_at: IsoTimestamp;
    local_date: IsoLocalDate;
    bleeding_intensity: number | null;
    clots: number | null;
    mood: number | null;
    energy: number | null;
    stress_level: number | null;
    breast_sensitivity: number | null;
    libido: number | null;
    pain_intensity: number | null;
    pain_interference: number | null;
    pms_intensity: number | null;
    period_status_signal: PeriodStatusSignal | null;
    note: string | null;
    created_at: IsoTimestamp;
    updated_at: IsoTimestamp;
    deleted_at: IsoTimestamp | null;
    version: number;
}

/** Sintoma elegido dentro de un check-in con intensidad observada. */
export interface CheckInSymptomEntity {
    checkin_id: UuidV7;
    symptom_key: string;
    intensity: number;
    created_at: IsoTimestamp;
    updated_at: IsoTimestamp;
    deleted_at: IsoTimestamp | null;
    version: number;
}

/** Toma de medicacion asociada a check-in y alivio percibido. */
export interface CheckInMedicationEntity {
    id: UuidV7;
    checkin_id: UuidV7;
    medication_id: UuidV7;
    taken_at: IsoTimestamp;
    relief: number;
    dose_note: string | null;
    created_at: IsoTimestamp;
    updated_at: IsoTimestamp;
    deleted_at: IsoTimestamp | null;
    version: number;
}

/** Read model diario regenerable para pantallas y estadisticas. */
export interface DailySummaryEntity {
    local_date: IsoLocalDate;
    user_id: UuidV7;
    is_menstruation_day: SqliteBoolean;
    menstruation_basis: MenstruationBasis;
    is_spotting_day: SqliteBoolean;
    had_medication: SqliteBoolean;
    avg_mood: number | null;
    avg_energy: number | null;
    avg_stress: number | null;
    max_pain: number | null;
    max_symptom_intensity: number;
    top_symptom_key: string | null;
    medication_relief_score: number | null;
    estimated_phase: EstimatedPhase;
    phase_source: PhaseSource;
    phase_confidence: PhaseConfidence;
    updated_at: IsoTimestamp;
}

/** Fuente editorial auditable; labels visibles se resuelven con i18n local. */
export interface ContentSourceEntity {
    id: string;
    label_key: string;
    reference_key: string | null;
    source_url: string | null;
    source_type: ContentSourceType;
    reviewed_at: IsoLocalDate | null;
    created_at: IsoTimestamp;
    updated_at: IsoTimestamp;
}

/** Pieza editorial versionada con copy visible fuera de SQLite. */
export interface ContentItemEntity {
    id: string;
    content_type: ContentType;
    topic: string;
    title_key: string;
    body_key: string;
    min_confidence: PhaseConfidence | null;
    priority: number;
    locale: string;
    source_id: string | null;
    content_version: string;
    is_active: SqliteBoolean;
    valid_from: IsoLocalDate | null;
    valid_until: IsoLocalDate | null;
    reviewed_at: IsoLocalDate | null;
    created_at: IsoTimestamp;
    updated_at: IsoTimestamp;
}

/** Regla estructurada que decide cuando una pieza editorial aplica. */
export interface ContentRuleEntity {
    id: string;
    content_item_id: string;
    trigger_type: ContentTriggerType;
    trigger_key: string | null;
    min_value: number | null;
    max_value: number | null;
    required_value: string | null;
    priority: number;
    created_at: IsoTimestamp;
    updated_at: IsoTimestamp;
}

/** Historial local minimo para no repetir contenido editorial de inmediato. */
export interface ContentDeliveryLogEntity {
    id: UuidV7;
    user_id: UuidV7;
    content_item_id: string;
    surface: ContentSurface;
    shown_at: IsoTimestamp;
    dismissed_at: IsoTimestamp | null;
}
