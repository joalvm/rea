-- ============================================================================
-- REA - Esquema SQLite v2 (ARCHIVO MAESTRO)
-- Contrato local-first para datos normalizados de seguimiento menstrual.
-- La copia visible (textos) vive en src/lang; este esquema solo guarda IDs,
-- reglas, versiones, URLs y claves de traducción.
--
-- Define el esquema completo en una sola pasada (no usa migraciones).
-- Normalizado hasta 3FN en las tablas canónicas. `daily_summary` es un read
-- model derivado (proyección de lectura), reconstruible desde los check-ins.
-- ============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

BEGIN;

-- ----------------------------------------------------------------------------
-- Sello de versión del esquema
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schema_migrations (
    version     INTEGER PRIMARY KEY NOT NULL,
    name        TEXT NOT NULL UNIQUE,
    applied_at  TEXT NOT NULL
) STRICT;

-- ----------------------------------------------------------------------------
-- Perfil de la usuaria (fila única en la app local)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profile (
    id                       TEXT PRIMARY KEY NOT NULL, -- UUIDv7 generado en el cliente.
    name                     TEXT NOT NULL,
    birth_year               INTEGER CHECK (birth_year IS NULL OR (birth_year BETWEEN 1900 AND 2100)), -- Solo el año: basta para contenido por banda de edad y minimiza el dato sensible. El onboarding pide año (o año+mes), no fecha completa.
    reminders_enabled        INTEGER NOT NULL DEFAULT 1 CHECK (reminders_enabled IN (0, 1)),
    reminder_interval_hours  INTEGER NOT NULL DEFAULT 6 CHECK (reminder_interval_hours BETWEEN 1 AND 24),
    reminder_window_start    TEXT NOT NULL DEFAULT '09:00' CHECK (reminder_window_start LIKE '__:__'),
    reminder_window_end      TEXT NOT NULL DEFAULT '22:00' CHECK (reminder_window_end LIKE '__:__'),
    onboarding_completed_at  TEXT NULL,
    created_at               TEXT NOT NULL,
    updated_at               TEXT NOT NULL,
    version                  INTEGER NOT NULL DEFAULT 1
) STRICT;

-- ----------------------------------------------------------------------------
-- Intención reproductiva (historial temporal/versionado)
-- Cada cambio de contexto cierra la fila vigente (effective_to) y abre una nueva.
-- La fila vigente es la que tiene effective_to NULL.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reproductive_intent_history (
    id                         TEXT PRIMARY KEY NOT NULL, -- UUIDv7 generado en el cliente.
    user_id                    TEXT NOT NULL,
    effective_from             TEXT NOT NULL,
    effective_to               TEXT,
    regularity                 TEXT NOT NULL CHECK (regularity IN ('regular', 'variable', 'irregular')),
    trying_to_conceive         INTEGER NOT NULL CHECK (trying_to_conceive IN (0, 1)),
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
    FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
) STRICT;

CREATE INDEX IF NOT EXISTS ix_reproductive_intent_active_date
ON reproductive_intent_history(user_id, effective_from DESC, effective_to);

-- Integridad: un único contexto reproductivo vigente por usuaria.
CREATE UNIQUE INDEX IF NOT EXISTS uq_reproductive_intent_single_open
ON reproductive_intent_history(user_id)
WHERE effective_to IS NULL AND deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- Rachas de periodo (episodios menstruales)
-- status: open (en curso) / closed (cerrado) / excluded (la usuaria lo descarta).
-- source: confirmado por la usuaria, inferido del sangrado, o mixto.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS period_runs (
    id          TEXT PRIMARY KEY NOT NULL, -- UUIDv7 generado en el cliente.
    user_id     TEXT NOT NULL,
    start_date  TEXT NOT NULL,
    end_date    TEXT,
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

CREATE INDEX IF NOT EXISTS ix_period_runs_chronological
ON period_runs(user_id, start_date DESC, deleted_at);

-- Integridad: a lo sumo un periodo en curso por usuaria.
CREATE UNIQUE INDEX IF NOT EXISTS uq_period_runs_single_open
ON period_runs(user_id)
WHERE status = 'open' AND deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- Embarazo (ciclo de vida mínimo)
-- Un episodio con fechas, igual que period_runs. El motor trata cualquier fecha
-- dentro de un episodio como "sin estimación de ciclo" (pausa las predicciones).
-- El seguimiento semana a semana queda fuera de alcance a propósito.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pregnancy_episodes (
    id          TEXT PRIMARY KEY NOT NULL, -- UUIDv7 generado en el cliente.
    user_id     TEXT NOT NULL,
    start_date  TEXT NOT NULL,             -- Inicio declarado/confirmado (suele ser la fecha de la última regla).
    end_date    TEXT,                      -- NULL mientras el embarazo sigue en curso.
    outcome     TEXT CHECK (outcome IN ('birth', 'loss', 'other') OR outcome IS NULL), -- Desenlace: parto, pérdida u otro.
    note        TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    deleted_at  TEXT,
    version     INTEGER NOT NULL DEFAULT 1,

    CHECK (start_date LIKE '____-__-__'),
    CHECK (end_date IS NULL OR end_date LIKE '____-__-__'),
    CHECK (end_date IS NULL OR end_date >= start_date),
    -- Un episodio en curso no lleva desenlace; el outcome se fija solo al terminar.
    CHECK (end_date IS NOT NULL OR outcome IS NULL),
    FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
) STRICT;

CREATE INDEX IF NOT EXISTS ix_pregnancy_chronological
ON pregnancy_episodes(user_id, start_date DESC);

-- Integridad: a lo sumo un embarazo en curso por usuaria.
CREATE UNIQUE INDEX IF NOT EXISTS uq_pregnancy_single_ongoing
ON pregnancy_episodes(user_id)
WHERE end_date IS NULL AND deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- Catálogo de síntomas (global, sembrado)
-- ui_priority ordena la lista; is_quick_option marca los de acceso rápido.
-- Datos semilla viven en src/db/seeders/symptomCatalogSeeder.ts.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS symptom_catalog (
    symptom_key      TEXT PRIMARY KEY NOT NULL,
    group_key        TEXT NOT NULL CHECK (group_key IN (
                         'pain',
                         'digestive',
                         'skin',
                         'sleep',
                         'mood',
                         'energy',
                         'bleeding',
                         'body',
                         'sexual_health',
                         'other'
                     )),
    label_key        TEXT NOT NULL,
    ui_priority      INTEGER NOT NULL DEFAULT 100,
    is_quick_option  INTEGER NOT NULL DEFAULT 0 CHECK (is_quick_option IN (0, 1)),
    is_active        INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at       TEXT NOT NULL,
    updated_at       TEXT NOT NULL
) STRICT;

-- ----------------------------------------------------------------------------
-- Catálogo de medicamentos (por usuaria)
-- normalized_name permite deduplicar "Ibuprofeno" vs "ibuprofeno".
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medication_catalog (
    id               TEXT PRIMARY KEY NOT NULL, -- UUIDv7 generado en el cliente.
    user_id          TEXT NOT NULL,
    name             TEXT NOT NULL,
    normalized_name  TEXT NOT NULL,
    created_at       TEXT NOT NULL,
    updated_at       TEXT NOT NULL,
    deleted_at       TEXT,
    version          INTEGER NOT NULL DEFAULT 1,

    CHECK (length(trim(name)) > 0),
    CHECK (length(trim(normalized_name)) > 0),
    FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
) STRICT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_medication_catalog_active_name
ON medication_catalog(user_id, normalized_name) WHERE deleted_at IS NULL;

-- ----------------------------------------------------------------------------
-- Check-ins (registro puntual de sensaciones y señales)
-- Varios por día: recorded_at es el instante exacto; local_date agrupa por día
-- local. Las escalas que arrancan en 0 usan 0 = "ninguno/no aplica".
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS checkins (
    id                      TEXT PRIMARY KEY NOT NULL, -- UUIDv7 generado en el cliente.
    user_id                 TEXT NOT NULL,
    recorded_at             TEXT NOT NULL,
    local_date              TEXT NOT NULL,
    bleeding_intensity      INTEGER CHECK (bleeding_intensity BETWEEN 0 AND 4),
    clots                   INTEGER CHECK (clots BETWEEN 0 AND 3),
    cervical_mucus          INTEGER CHECK (cervical_mucus IS NULL OR (cervical_mucus BETWEEN 0 AND 4)), -- Señal de fertilidad autoobservable: 0 seco, 1 pegajoso, 2 cremoso, 3 acuoso, 4 clara de huevo (pico). Solo en modo TTC y sin anticoncepción hormonal.
    mood                    INTEGER CHECK (mood BETWEEN 1 AND 5),
    energy                  INTEGER CHECK (energy BETWEEN 1 AND 5),
    stress_level            INTEGER CHECK (stress_level BETWEEN 0 AND 5),
    breast_sensitivity      INTEGER CHECK (breast_sensitivity BETWEEN 0 AND 5),
    libido                  INTEGER CHECK (libido BETWEEN 0 AND 4),
    pain_intensity          INTEGER CHECK (pain_intensity BETWEEN 0 AND 5),
    pain_interference       INTEGER CHECK (pain_interference BETWEEN 0 AND 3),
    pms_intensity           INTEGER CHECK (pms_intensity BETWEEN 0 AND 5),
    period_status_signal    TEXT CHECK (
                                period_status_signal IN ('started', 'ended', 'ongoing') OR
                                period_status_signal IS NULL
                            ),
    note                    TEXT,
    excluded_from_summary   INTEGER NOT NULL DEFAULT 0 CHECK (excluded_from_summary IN (0, 1)), -- Oculta el check-in de las agregaciones sin borrarlo (distinto de deleted_at).
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
-- Síntomas por check-in (relación N:M con intensidad)
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
-- Medicamentos por check-in (qué se tomó y cuánto alivió)
-- relief: NULL = sin evaluar aún, 0 = nada, 1 = algo, 2 = mucho.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS checkin_medications (
    id             TEXT PRIMARY KEY NOT NULL, -- UUIDv7 generado en el cliente.
    checkin_id     TEXT NOT NULL,
    medication_id  TEXT NOT NULL,
    taken_at       TEXT NOT NULL,
    relief         INTEGER CHECK (relief BETWEEN 0 AND 2),
    dose_note      TEXT,
    created_at     TEXT NOT NULL,
    updated_at     TEXT NOT NULL,
    deleted_at     TEXT,
    version        INTEGER NOT NULL DEFAULT 1,

    FOREIGN KEY (checkin_id) REFERENCES checkins(id) ON DELETE CASCADE,
    FOREIGN KEY (medication_id) REFERENCES medication_catalog(id)
) STRICT;

CREATE INDEX IF NOT EXISTS ix_checkin_medications_lookup
ON checkin_medications(medication_id, taken_at, deleted_at);

-- ----------------------------------------------------------------------------
-- Relaciones sexuales (eventos de primera clase)
-- Es un evento, no una sensación: puede ocurrir varias veces al día y sin
-- check-in, por eso es tabla propia y no un campo en checkins.
-- protected: 1 con protección, 0 sin protección, NULL sin especificar.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS intercourse_log (
    id           TEXT PRIMARY KEY NOT NULL, -- UUIDv7 generado en el cliente.
    user_id      TEXT NOT NULL,
    occurred_at  TEXT NOT NULL,             -- Marca de tiempo ISO del evento.
    local_date   TEXT NOT NULL,             -- Día local materializado para agrupar (igual que checkins).
    protected    INTEGER CHECK (protected IN (0, 1) OR protected IS NULL),
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
-- Resumen diario (READ MODEL derivado, reconstruible)
-- Proyección de lectura para calendario y estadísticas. No es transaccional: se
-- reconstruye desde los check-ins (por eso vive fuera del objetivo de 3FN y no
-- lleva soft-delete). phase_source/phase_confidence sostienen la honestidad de
-- la predicción: nunca se muestra una fase como certeza.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_summary (
    local_date                  TEXT NOT NULL,
    user_id                     TEXT NOT NULL,
    is_menstruation_day         INTEGER NOT NULL DEFAULT 0 CHECK (is_menstruation_day IN (0, 1)),
    menstruation_basis          TEXT NOT NULL DEFAULT 'none'
                                    CHECK (menstruation_basis IN ('none', 'confirmed_period', 'inferred_bleeding')),
    is_spotting_day             INTEGER NOT NULL DEFAULT 0 CHECK (is_spotting_day IN (0, 1)),
    had_medication              INTEGER NOT NULL DEFAULT 0 CHECK (had_medication IN (0, 1)),
    had_intercourse             INTEGER NOT NULL DEFAULT 0 CHECK (had_intercourse IN (0, 1)), -- Marcador para el calendario, igual que had_medication.
    avg_mood                    REAL,
    avg_energy                  REAL,
    avg_stress                  REAL,
    max_pain                    INTEGER CHECK (max_pain BETWEEN 0 AND 5 OR max_pain IS NULL),
    max_symptom_intensity       INTEGER NOT NULL DEFAULT 0 CHECK (max_symptom_intensity BETWEEN 0 AND 5),
    top_symptom_key             TEXT,
    medication_relief_score     REAL,
    estimated_phase             TEXT NOT NULL DEFAULT 'unknown'
                                    CHECK (estimated_phase IN (
                                        'unknown',
                                        'menstrual',
                                        'follicular',
                                        'fertile_window',
                                        'estimated_ovulation',
                                        'luteal'
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
-- Fuentes de contenido (respaldo/cita de cada pieza educativa)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_sources (
    id             TEXT PRIMARY KEY NOT NULL,
    label_key      TEXT NOT NULL,
    reference_key  TEXT,
    source_url     TEXT,
    source_type    TEXT NOT NULL CHECK (source_type IN (
                       'medical_guideline',
                       'government_health',
                       'peer_reviewed',
                       'clinical_education',
                       'book',
                       'other'
                   )),
    reviewed_at    TEXT,
    created_at     TEXT NOT NULL,
    updated_at     TEXT NOT NULL
) STRICT;

-- ----------------------------------------------------------------------------
-- Ítems de contenido (tip, trivia, recomendación, educativo, alerta)
-- min_confidence: confianza mínima de fase para mostrarlo (no aconsejar a ciegas).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_items (
    id               TEXT PRIMARY KEY NOT NULL,
    content_type     TEXT NOT NULL CHECK (content_type IN (
                         'tip',
                         'trivia',
                         'recommendation',
                         'educational',
                         'alert'
                     )),
    topic            TEXT NOT NULL,
    title_key        TEXT NOT NULL,
    body_key         TEXT NOT NULL,
    min_confidence   TEXT CHECK (min_confidence IN ('low', 'medium', 'high') OR min_confidence IS NULL),
    priority         INTEGER NOT NULL DEFAULT 100,
    locale           TEXT NOT NULL DEFAULT 'es',
    source_id        TEXT,
    content_version  TEXT NOT NULL,
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
-- Reglas de contenido (motor de disparo)
-- Dispara por fase, síntoma, umbral de métrica, intención reproductiva,
-- anticoncepción o general. Ya cubre los casos de TTC y anticoncepción.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_rules (
    id               TEXT PRIMARY KEY NOT NULL,
    content_item_id  TEXT NOT NULL,
    trigger_type     TEXT NOT NULL CHECK (trigger_type IN (
                         'phase',
                         'symptom',
                         'metric_threshold',
                         'reproductive_intent',
                         'contraception',
                         'general'
                     )),
    trigger_key      TEXT,
    min_value        REAL,
    max_value        REAL,
    required_value   TEXT,
    priority         INTEGER NOT NULL DEFAULT 100,
    created_at       TEXT NOT NULL,
    updated_at       TEXT NOT NULL,

    FOREIGN KEY (content_item_id) REFERENCES content_items(id) ON DELETE CASCADE
) STRICT;

-- ----------------------------------------------------------------------------
-- Registro de entrega de contenido (qué se mostró, dónde y si se descartó)
-- Evita repetir lo ya visto y permite rotar.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_delivery_log (
    id               TEXT PRIMARY KEY NOT NULL, -- UUIDv7 generado en el cliente.
    user_id          TEXT NOT NULL,
    content_item_id  TEXT NOT NULL,
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
-- Sello de versión
-- ----------------------------------------------------------------------------
INSERT OR IGNORE INTO schema_migrations(version, name, applied_at)
VALUES (2, 'schema_v2', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'));

COMMIT;

PRAGMA user_version = 2;
