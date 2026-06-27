-- ============================================================================
-- REA - Esquema SQLite v1 (ARCHIVO MAESTRO)
-- Contrato local-first para datos normalizados de seguimiento menstrual,
-- intento de embarazo (TTC) y embarazo.
--
-- Filosofía:
-- 1. Perfil y Configuración separados (1:1).
-- 2. 3FN en datos transaccionales (escritura).
-- 3. Proyecciones de lectura desnormalizadas (daily_summary, cycle_predictions).
-- 4. Modo de la app regido por `reproductive_intent_history.current_mode`.
--    - 'cycle_tracking': Predicciones de periodo y ovulación estándar.
--    - 'ttc': Foco en ventana fértil, temperatura basal y tests de ovulación.
--    - 'pregnancy': Pausa predicciones de ciclo, activa predicciones de semana.
-- ============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

BEGIN;

-- ----------------------------------------------------------------------------
-- PERFIL DE LA USUARIA (Solo datos personales y biométricos)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profile (
    id            TEXT PRIMARY KEY NOT NULL, -- UUIDv7 generado en el cliente.
    name          TEXT NOT NULL,             -- Nombre para personalizar la UX.
    birth_year    INTEGER CHECK (birth_year IS NULL OR (birth_year BETWEEN 1900 AND 2100)), -- Solo año: minimiza PII y permite bandas de edad.
    created_at    TEXT NOT NULL,             -- Fecha de creación de la cuenta local.
    updated_at    TEXT NOT NULL,             -- Última modificación.
    version       INTEGER NOT NULL DEFAULT 1 -- Lock optimista para futuras sincronizaciones.
) STRICT;

-- ----------------------------------------------------------------------------
-- CONFIGURACIÓN DE LA APP (Preferencias de UX y notificaciones)
-- Separado del perfil para no mezclar datos personales con settings de UI.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_settings (
    user_id                    TEXT PRIMARY KEY NOT NULL,
    reminders_enabled          INTEGER NOT NULL DEFAULT 1 CHECK (reminders_enabled IN (0, 1)),
    reminder_interval_hours    INTEGER NOT NULL DEFAULT 6 CHECK (reminder_interval_hours BETWEEN 1 AND 24),
    reminder_window_start      TEXT NOT NULL DEFAULT '09:00' CHECK (reminder_window_start LIKE '__:__'),
    reminder_window_end        TEXT NOT NULL DEFAULT '22:00' CHECK (reminder_window_end LIKE '__:__'),
    theme                      TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('system', 'light', 'dark')),
    temperature_unit           TEXT NOT NULL DEFAULT 'celsius' CHECK (temperature_unit IN ('celsius', 'fahrenheit')),
    onboarding_completed_at    TEXT, -- Fecha de finalización del onboarding (NULL si no se completó).
    created_at                 TEXT NOT NULL,
    updated_at                 TEXT NOT NULL,
    version                    INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
) STRICT;

-- ----------------------------------------------------------------------------
-- INTENCIÓN REPRODUCTIVA (Master Switch del Hero de la App)
-- Cambiar el `current_mode` transforma la interfaz y las predicciones.
-- `cycle_intent` refina el modo ciclo: `track_only` (neutral) o
-- `avoid_pregnancy` (método del ritmo/sintotérmico). NULL en ttc/pregnancy.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reproductive_intent_history (
    id                         TEXT PRIMARY KEY NOT NULL, -- UUIDv7.
    user_id                    TEXT NOT NULL,
    effective_from             TEXT NOT NULL,             -- Fecha de vigencia del modo.
    effective_to               TEXT,                      -- NULL si es el modo actual.
    current_mode               TEXT NOT NULL CHECK (current_mode IN (
                                   'cycle_tracking',     -- Pilar 1: Seguimiento estándar.
                                   'ttc',                -- Pilar 2: Buscando embarazo.
                                   'pregnancy'           -- Pilar 3: Embarazo en curso.
                               )),
    cycle_intent               TEXT CHECK (cycle_intent IS NULL OR cycle_intent IN (
                                   'track_only',         -- Seguimiento neutral.
                                   'avoid_pregnancy'     -- Anticonceptivo natural (ritmo/sintotérmico).
                               )),                       -- NOT NULL solo cuando current_mode = 'cycle_tracking'.
    regularity                 TEXT NOT NULL CHECK (regularity IN ('regular', 'variable', 'irregular')),
    hormonal_contraception     INTEGER NOT NULL CHECK (hormonal_contraception IN (0, 1)),
    declared_cycle_length      INTEGER NOT NULL CHECK (declared_cycle_length BETWEEN 15 AND 90),
    declared_period_length     INTEGER NOT NULL CHECK (declared_period_length BETWEEN 1 AND 15),
    created_at                 TEXT NOT NULL,
    updated_at                 TEXT NOT NULL,
    deleted_at                 TEXT,
    version                    INTEGER NOT NULL DEFAULT 1,

    CHECK (effective_from LIKE '____-__-__'),
    CHECK (effective_to IS NULL OR effective_to LIKE '____-__-__'),
    CHECK (effective_to IS NULL OR effective_to >= effective_from),
    -- cycle_intent obligatorio en modo ciclo, prohibido en ttc/pregnancy.
    CHECK ((current_mode = 'cycle_tracking') = (cycle_intent IS NOT NULL)),
    -- TTC y anticoncepción hormonal son excluyentes.
    CHECK (NOT (current_mode = 'ttc' AND hormonal_contraception = 1)),
    FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
) STRICT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_reproductive_intent_single_open
ON reproductive_intent_history(user_id)
WHERE effective_to IS NULL AND deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- RACHAS DE PERIODO (Episodios menstruales)
-- Se pausa automáticamente si `current_mode` cambia a 'pregnancy'.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS period_runs (
    id          TEXT PRIMARY KEY NOT NULL, -- UUIDv7.
    user_id     TEXT NOT NULL,
    start_date  TEXT NOT NULL,             -- Inicio del sangrado.
    end_date    TEXT,                      -- Fin del sangrado (NULL en curso).
    status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'excluded')),
    source      TEXT NOT NULL DEFAULT 'user_confirmed'
                    CHECK (source IN ('user_confirmed', 'bleeding_inferred', 'mixed')),
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    deleted_at  TEXT,
    version     INTEGER NOT NULL DEFAULT 1,

    CHECK (start_date LIKE '____-__-__'),
    CHECK (end_date IS NULL OR end_date LIKE '____-__-__'),
    CHECK (end_date IS NULL OR end_date >= start_date),
    FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
) STRICT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_period_runs_start_active
ON period_runs(user_id, start_date) WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_period_runs_single_open
ON period_runs(user_id) WHERE status = 'open' AND deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- EPISODIOS DE EMBARAZO (Pilar 3)
-- Reemplaza a period_runs como evento principal cuando current_mode = 'pregnancy'.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pregnancy_episodes (
    id              TEXT PRIMARY KEY NOT NULL, -- UUIDv7.
    user_id         TEXT NOT NULL,
    lmp_date        TEXT NOT NULL,             -- Fecha de Última Menstruación (FUM). Base matemática para calcular semanas.
    due_date        TEXT,                      -- Fecha probable de parto (FPP). Calculada con regla de Naegele (LMP + 280 días).
    end_date        TEXT,                      -- NULL mientras el embarazo está en curso.
    outcome         TEXT CHECK (outcome IN ('birth', 'loss', 'other') OR outcome IS NULL), -- Desenlace.
    outcome_details TEXT,                      -- Notas del desenlace (ej. "Parto vaginal", "Aborto espontáneo a las 8 sem").
    created_at      TEXT NOT NULL,
    updated_at      TEXT NOT NULL,
    deleted_at      TEXT,
    version         INTEGER NOT NULL DEFAULT 1,

    CHECK (lmp_date LIKE '____-__-__'),
    CHECK (end_date IS NULL OR end_date LIKE '____-__-__'),
    CHECK (end_date IS NULL OR end_date >= lmp_date),
    CHECK (end_date IS NOT NULL OR outcome IS NULL),
    FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
) STRICT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_pregnancy_single_ongoing
ON pregnancy_episodes(user_id) WHERE end_date IS NULL AND deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- CATÁLOGO DE SÍNTOMAS (Global)
-- `applicable_mode` filtra qué síntomas mostrar según el estado de la usuaria.
-- Ej: "Náuseas" aplica en TTC y Pregnancy. "Cólicos menstruales" en Cycle.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS symptom_catalog (
    symptom_key      TEXT PRIMARY KEY NOT NULL,
    group_key        TEXT NOT NULL CHECK (group_key IN (
                         'pain', 'digestive', 'skin', 'sleep', 'mood',
                         'energy', 'bleeding', 'body', 'sexual_health', 'other'
                     )),
    label_key        TEXT NOT NULL,            -- Clave para i18n en src/lang.
    applicable_mode  TEXT NOT NULL DEFAULT 'all' CHECK (applicable_mode IN (
                         'cycle_tracking', 'ttc', 'pregnancy', 'all'
                     )),
    ui_priority      INTEGER NOT NULL DEFAULT 100,
    is_quick_option  INTEGER NOT NULL DEFAULT 0 CHECK (is_quick_option IN (0, 1)),
    is_active        INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at       TEXT NOT NULL,
    updated_at       TEXT NOT NULL
) STRICT;

-- ----------------------------------------------------------------------------
-- CATÁLOGO DE MEDICAMENTOS (Por usuaria)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medication_catalog (
    id               TEXT PRIMARY KEY NOT NULL, -- UUIDv7.
    user_id          TEXT NOT NULL,
    name             TEXT NOT NULL,
    normalized_name  TEXT NOT NULL,             -- Minúsculas/sin espacios para deduplicar.
    is_pregnancy_safe INTEGER NOT NULL DEFAULT 0 CHECK (is_pregnancy_safe IN (0, 1)), -- Alerta visual si está embarazada.
    created_at       TEXT NOT NULL,
    updated_at       TEXT NOT NULL,
    deleted_at       TEXT,
    version          INTEGER NOT NULL DEFAULT 1,

    CHECK (length(trim(name)) > 0),
    FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
) STRICT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_medication_catalog_active_name
ON medication_catalog(user_id, normalized_name) WHERE deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- CHECK-INS (El core de captura de datos)
-- Captura señales de Pilar 1, 2 y 3. Lo que no aplica se deja en NULL.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS checkins (
    id                      TEXT PRIMARY KEY NOT NULL, -- UUIDv7.
    user_id                 TEXT NOT NULL,
    recorded_at             TEXT NOT NULL,             -- Timestamp ISO exacto.
    local_date              TEXT NOT NULL,             -- 'YYYY-MM-DD' inmutable.

    -- Señales de Ciclo (Pilar 1)
    bleeding_intensity      INTEGER CHECK (bleeding_intensity BETWEEN 0 AND 4), -- 0=nada, 1=spotting, 2=ligero, 3=moderado, 4=abundante.
    clots                   INTEGER CHECK (clots BETWEEN 0 AND 3),
    mood                    INTEGER CHECK (mood BETWEEN 1 AND 5),
    energy                  INTEGER CHECK (energy BETWEEN 1 AND 5),
    stress_level            INTEGER CHECK (stress_level BETWEEN 0 AND 5),
    pain_intensity          INTEGER CHECK (pain_intensity BETWEEN 0 AND 5),
    pain_interference       INTEGER CHECK (pain_interference BETWEEN 0 AND 3),
    pms_intensity           INTEGER CHECK (pms_intensity BETWEEN 0 AND 5),
    period_status_signal    TEXT CHECK (period_status_signal IN ('started', 'ended', 'ongoing') OR period_status_signal IS NULL),

    -- Señales de Fertilidad y TTC (Pilar 2)
    cervical_mucus          INTEGER CHECK (cervical_mucus IS NULL OR (cervical_mucus BETWEEN 0 AND 4)), -- 0 seco, 4 pico fértil.
    cervical_position       INTEGER CHECK (cervical_position IS NULL OR (cervical_position BETWEEN 0 AND 2)), -- 0 bajo, 1 medio, 2 alto.
    basal_body_temp_c       REAL CHECK (basal_body_temp_c IS NULL OR (basal_body_temp_c BETWEEN 35.0 AND 38.0)), -- Temperatura basal en ºC.
    opk_result              TEXT CHECK (opk_result IN ('negative', 'positive', 'invalid') OR opk_result IS NULL), -- Test de ovulación.
    pregnancy_test_result   TEXT CHECK (pregnancy_test_result IN ('negative', 'positive', 'invalid') OR pregnancy_test_result IS NULL), -- Test de embarazo.

    -- Señales de Embarazo (Pilar 3)
    morning_sickness        INTEGER CHECK (morning_sickness IS NULL OR (morning_sickness BETWEEN 0 AND 3)), -- 0 no, 1 leve, 2 moderado, 3 severo.
    fetal_movement          INTEGER CHECK (fetal_movement IS NULL OR (fetal_movement BETWEEN 0 AND 3)),

    -- Metadata
    note                    TEXT,
    excluded_from_summary   INTEGER NOT NULL DEFAULT 0 CHECK (excluded_from_summary IN (0, 1)), -- Oculto de stats sin borrar.
    created_at              TEXT NOT NULL,
    updated_at              TEXT NOT NULL,
    deleted_at              TEXT,
    version                 INTEGER NOT NULL DEFAULT 1,

    CHECK (local_date LIKE '____-__-__'),
    FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
) STRICT;

CREATE INDEX IF NOT EXISTS ix_checkins_date_search
ON checkins(user_id, local_date, deleted_at);

CREATE INDEX IF NOT EXISTS ix_checkins_chronological
ON checkins(user_id, recorded_at DESC, deleted_at);

-- ----------------------------------------------------------------------------
-- SÍNTOMAS POR CHECK-IN (Relación N:M)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS checkin_symptoms (
    checkin_id    TEXT NOT NULL,
    symptom_key   TEXT NOT NULL,
    intensity     INTEGER NOT NULL CHECK (intensity BETWEEN 1 AND 5),
    created_at    TEXT NOT NULL,
    updated_at    TEXT NOT NULL,
    deleted_at    TEXT,
    version       INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (checkin_id, symptom_key),
    FOREIGN KEY (checkin_id) REFERENCES checkins(id) ON DELETE CASCADE,
    FOREIGN KEY (symptom_key) REFERENCES symptom_catalog(symptom_key)
) STRICT;

CREATE INDEX IF NOT EXISTS ix_checkin_symptoms_lookup
ON checkin_symptoms(symptom_key, intensity, deleted_at);

-- ----------------------------------------------------------------------------
-- MEDICAMENTOS POR CHECK-IN
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS checkin_medications (
    id             TEXT PRIMARY KEY NOT NULL, -- UUIDv7.
    checkin_id     TEXT NOT NULL,
    medication_id  TEXT NOT NULL,
    taken_at       TEXT NOT NULL,
    relief         INTEGER CHECK (relief BETWEEN 0 AND 2), -- 0 nada, 1 algo, 2 mucho.
    dose_note      TEXT,
    created_at     TEXT NOT NULL,
    updated_at     TEXT NOT NULL,
    deleted_at     TEXT,
    version        INTEGER NOT NULL DEFAULT 1,

    FOREIGN KEY (checkin_id) REFERENCES checkins(id) ON DELETE CASCADE,
    FOREIGN KEY (medication_id) REFERENCES medication_catalog(id)
) STRICT;

CREATE INDEX IF NOT EXISTS ix_checkin_medications_by_checkin
ON checkin_medications(checkin_id, deleted_at);

CREATE INDEX IF NOT EXISTS ix_checkin_medications_lookup
ON checkin_medications(medication_id, taken_at, deleted_at);

-- ----------------------------------------------------------------------------
-- RELACIONES SEXUALES (Evento de primera clase)
-- En TTC es crucial para timing. En Cycle es informativo.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS intercourse_log (
    id           TEXT PRIMARY KEY NOT NULL, -- UUIDv7.
    user_id      TEXT NOT NULL,
    occurred_at  TEXT NOT NULL,
    local_date   TEXT NOT NULL,
    protected    INTEGER CHECK (protected IN (0, 1) OR protected IS NULL),
    in_fertile_window INTEGER CHECK (in_fertile_window IN (0, 1) OR in_fertile_window IS NULL), -- Marcador estadístico calculado por la app.
    created_at   TEXT NOT NULL,
    updated_at   TEXT NOT NULL,
    deleted_at   TEXT,
    version      INTEGER NOT NULL DEFAULT 1,

    CHECK (local_date LIKE '____-__-__'),
    FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
) STRICT;

CREATE INDEX IF NOT EXISTS ix_intercourse_log_date
ON intercourse_log(user_id, local_date, deleted_at);

-- ----------------------------------------------------------------------------
-- RESUMEN DIARIO (READ MODEL: Proyección para el Calendario y Hero)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_summary (
    local_date                  TEXT NOT NULL,
    user_id                     TEXT NOT NULL,

    -- Marcadores de Ciclo/TTC
    is_menstruation_day         INTEGER NOT NULL DEFAULT 0 CHECK (is_menstruation_day IN (0, 1)),
    menstruation_basis          TEXT NOT NULL DEFAULT 'none' CHECK (menstruation_basis IN ('none', 'confirmed_period', 'inferred_bleeding')),
    is_spotting_day             INTEGER NOT NULL DEFAULT 0 CHECK (is_spotting_day IN (0, 1)),
    is_fertile_day              INTEGER NOT NULL DEFAULT 0 CHECK (is_fertile_day IN (0, 1)), -- Basado en mucus/OPK/predicción.
    ovulation_confirmed         INTEGER NOT NULL DEFAULT 0 CHECK (ovulation_confirmed IN (0, 1)), -- 1 si BBT subió y se mantuvo.

    -- Marcadores de Embarazo
    is_pregnancy_day            INTEGER NOT NULL DEFAULT 0 CHECK (is_pregnancy_day IN (0, 1)),
    pregnancy_week              INTEGER,  -- Semana gestacional (0 a 42).
    pregnancy_trimester         INTEGER CHECK (pregnancy_trimester IS NULL OR (pregnancy_trimester BETWEEN 1 AND 3)),

    -- Agregaciones diarias
    had_medication              INTEGER NOT NULL DEFAULT 0 CHECK (had_medication IN (0, 1)),
    had_intercourse             INTEGER NOT NULL DEFAULT 0 CHECK (had_intercourse IN (0, 1)),
    avg_mood                    REAL,
    avg_energy                  REAL,
    avg_stress                  REAL,
    max_pain                    INTEGER CHECK (max_pain BETWEEN 0 AND 5 OR max_pain IS NULL),
    max_symptom_intensity       INTEGER NOT NULL DEFAULT 0 CHECK (max_symptom_intensity BETWEEN 0 AND 5),
    top_symptom_key             TEXT,
    medication_relief_score     REAL,

    -- Motor de Fases y Predicción Honesta
    estimated_phase             TEXT NOT NULL DEFAULT 'unknown'
                                    CHECK (estimated_phase IN (
                                        'unknown', 'menstrual', 'follicular', 'fertile_window',
                                        'estimated_ovulation', 'luteal', 'pregnancy_first_trimester',
                                        'pregnancy_second_trimester', 'pregnancy_third_trimester'
                                    )),
    phase_source                TEXT NOT NULL DEFAULT 'unknown'
                                    CHECK (phase_source IN ('observed', 'estimated', 'unknown')),
    phase_confidence            TEXT NOT NULL DEFAULT 'low'
                                    CHECK (phase_confidence IN ('low', 'medium', 'high')),
    updated_at                  TEXT NOT NULL,

    PRIMARY KEY (user_id, local_date),
    CHECK (local_date LIKE '____-__-__'),
    FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE,
    FOREIGN KEY (top_symptom_key) REFERENCES symptom_catalog(symptom_key)
) STRICT;

CREATE INDEX IF NOT EXISTS ix_daily_summary_phase
ON daily_summary(user_id, estimated_phase, phase_confidence, local_date);

-- ----------------------------------------------------------------------------
-- PREDICCIONES DE CICLO (READ MODEL: Cache de cálculos complejos)
-- Se recalcula en background cuando se cierra un periodo o se confirma ovulación.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cycle_predictions (
    user_id              TEXT NOT NULL,
    calculation_date     TEXT NOT NULL,    -- Día en que se ejecutó el algoritmo.
    predicted_next_start TEXT NOT NULL,    -- Próxima regla estimada.
    predicted_ovulation  TEXT,             -- Ovulación estimada.
    cycle_length_used    INTEGER NOT NULL, -- Media móvil usada (ej. 28).
    luteal_phase_used    INTEGER NOT NULL DEFAULT 14, -- Fase lútea asumida (14 por defecto, ajustable si hay BBT).
    confidence           TEXT NOT NULL CHECK (confidence IN ('low', 'medium', 'high')),

    PRIMARY KEY (user_id, calculation_date),
    FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
) STRICT;

-- ----------------------------------------------------------------------------
-- MOTOR DE CONTENIDO (Tips, Educación, Recomendaciones)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_sources (
    id             TEXT PRIMARY KEY NOT NULL,
    label_key      TEXT NOT NULL,
    reference_key  TEXT,
    source_url     TEXT,
    source_type    TEXT NOT NULL CHECK (source_type IN (
                       'medical_guideline', 'government_health', 'peer_reviewed',
                       'clinical_education', 'book', 'other'
                   )),
    reviewed_at    TEXT,
    created_at     TEXT NOT NULL,
    updated_at     TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS content_items (
    id               TEXT PRIMARY KEY NOT NULL,
    content_type     TEXT NOT NULL CHECK (content_type IN ('tip', 'trivia', 'recommendation', 'educational', 'alert')),
    topic            TEXT NOT NULL,
    title_key        TEXT NOT NULL,
    body_key         TEXT NOT NULL,
    min_confidence   TEXT CHECK (min_confidence IN ('low', 'medium', 'high') OR min_confidence IS NULL),
    target_mode      TEXT NOT NULL DEFAULT 'all' CHECK (target_mode IN (
                         'cycle_tracking', 'ttc', 'pregnancy', 'all'
                     )), -- Filtra si el tip es para ciclo, TTC o embarazo.
    priority         INTEGER NOT NULL DEFAULT 100,
    locale           TEXT NOT NULL DEFAULT 'es',
    source_id        TEXT,
    content_version  TEXT NOT NULL, -- Ej: "1.0.0". Si cambia, se vuelve a mostrar.
    is_active        INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    valid_from       TEXT,
    valid_until      TEXT,
    reviewed_at      TEXT,
    created_at       TEXT NOT NULL,
    updated_at       TEXT NOT NULL,

    CHECK (valid_until IS NULL OR valid_from IS NULL OR valid_until >= valid_from),
    FOREIGN KEY (source_id) REFERENCES content_sources(id)
) STRICT;

-- ----------------------------------------------------------------------------
-- REGLAS DE CONTENIDO (Motor de disparo)
-- Múltiples reglas para un mismo content_item_id se evalúan como AND lógico.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_rules (
    id               TEXT PRIMARY KEY NOT NULL,
    content_item_id  TEXT NOT NULL,
    trigger_type     TEXT NOT NULL CHECK (trigger_type IN (
                         'phase', 'symptom', 'metric_threshold', 'reproductive_intent',
                         'contraception', 'pregnancy_week', 'general'
                     )),
    trigger_key      TEXT,        -- Ej: 'pain' (symptom), 'luteal' (phase).
    min_value        REAL,        -- Ej: 3 (para pain >= 3).
    max_value        REAL,
    required_value   TEXT,        -- Ej: 'ttc' (intent).
    priority         INTEGER NOT NULL DEFAULT 100,
    created_at       TEXT NOT NULL,
    updated_at       TEXT NOT NULL,

    FOREIGN KEY (content_item_id) REFERENCES content_items(id) ON DELETE CASCADE
) STRICT;

-- ----------------------------------------------------------------------------
-- REGISTRO DE ENTREGA DE CONTENIDO
-- Rastrea si la VERSIÓN ACTUAL de un tip ya fue leída.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_delivery_log (
    id               TEXT PRIMARY KEY NOT NULL, -- UUIDv7.
    user_id          TEXT NOT NULL,
    content_item_id  TEXT NOT NULL,
    content_version  TEXT NOT NULL,             -- Vital: si el tip se actualiza, se muestra de nuevo.
    surface          TEXT NOT NULL CHECK (surface IN ('today', 'day_detail', 'statistics')),
    shown_at         TEXT NOT NULL,
    dismissed_at     TEXT,

    FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE,
    FOREIGN KEY (content_item_id) REFERENCES content_items(id) ON DELETE CASCADE
) STRICT;

CREATE INDEX IF NOT EXISTS ix_content_items_active_priority
ON content_items(is_active, locale, priority);

CREATE INDEX IF NOT EXISTS ix_content_rules_lookup
ON content_rules(trigger_type, trigger_key, priority);

CREATE INDEX IF NOT EXISTS ix_content_delivery_user_recent
ON content_delivery_log(user_id, surface, shown_at DESC);

-- ----------------------------------------------------------------------------
-- SELLO DE VERSIÓN
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schema_migrations (
    version     INTEGER PRIMARY KEY NOT NULL,
    name        TEXT NOT NULL UNIQUE,
    applied_at  TEXT NOT NULL
) STRICT;

INSERT OR IGNORE INTO schema_migrations(version, name, applied_at)
VALUES (1, 'schema_v1_cycle_intent', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'));

COMMIT;

PRAGMA user_version = 1;
