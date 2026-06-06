-- ============================================================================
-- REA - SQLite schema v1
-- Local-first contract for normalized menstrual tracking data.
-- Visible copy lives in src/lang; this schema stores IDs, rules, versions,
-- URLs, and translation keys only.
-- ============================================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

BEGIN;

CREATE TABLE IF NOT EXISTS schema_migrations (
    version     INTEGER PRIMARY KEY NOT NULL,
    name        TEXT NOT NULL UNIQUE,
    applied_at  TEXT NOT NULL
) STRICT;

CREATE TABLE IF NOT EXISTS user_profile (
    id                       TEXT PRIMARY KEY NOT NULL, -- UUIDv7 generated on client.
    reminders_enabled        INTEGER NOT NULL DEFAULT 1 CHECK (reminders_enabled IN (0, 1)),
    reminder_interval_hours  INTEGER NOT NULL DEFAULT 6 CHECK (reminder_interval_hours BETWEEN 1 AND 24),
    reminder_window_start    TEXT NOT NULL DEFAULT '09:00' CHECK (reminder_window_start LIKE '__:__'),
    reminder_window_end      TEXT NOT NULL DEFAULT '22:00' CHECK (reminder_window_end LIKE '__:__'),
    created_at               TEXT NOT NULL,
    updated_at               TEXT NOT NULL,
    version                  INTEGER NOT NULL DEFAULT 1
) STRICT;

CREATE TABLE IF NOT EXISTS reproductive_intent_history (
    id                         TEXT PRIMARY KEY NOT NULL, -- UUIDv7 generated on client.
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

CREATE TABLE IF NOT EXISTS period_runs (
    id          TEXT PRIMARY KEY NOT NULL, -- UUIDv7 generated on client.
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

INSERT OR IGNORE INTO symptom_catalog (
    symptom_key,
    group_key,
    label_key,
    ui_priority,
    is_quick_option,
    is_active,
    created_at,
    updated_at
) VALUES
('cramps', 'pain', 'checkIn:symptoms.cramps', 10, 1, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('pelvic_pain', 'pain', 'checkIn:symptoms.pelvicPain', 20, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('lower_back_pain', 'pain', 'checkIn:symptoms.lowerBackPain', 30, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('headache', 'pain', 'checkIn:symptoms.headache', 40, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('migraine', 'pain', 'checkIn:symptoms.migraine', 50, 1, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('bloating', 'digestive', 'checkIn:symptoms.bloating', 60, 1, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('nausea', 'digestive', 'checkIn:symptoms.nausea', 70, 1, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('diarrhea', 'digestive', 'checkIn:symptoms.diarrhea', 80, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('constipation', 'digestive', 'checkIn:symptoms.constipation', 90, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('acne', 'skin', 'checkIn:symptoms.acne', 100, 1, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('cravings', 'body', 'checkIn:symptoms.cravings', 110, 1, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('fatigue', 'energy', 'checkIn:symptoms.fatigue', 120, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('insomnia', 'sleep', 'checkIn:symptoms.insomnia', 130, 1, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('sleepiness', 'sleep', 'checkIn:symptoms.sleepiness', 140, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('breast_tenderness', 'body', 'checkIn:symptoms.breastTenderness', 150, 1, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('breast_swelling', 'body', 'checkIn:symptoms.breastSwelling', 160, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('mood_swings', 'mood', 'checkIn:symptoms.moodSwings', 170, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('irritability', 'mood', 'checkIn:symptoms.irritability', 180, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('anxiety', 'mood', 'checkIn:symptoms.anxiety', 190, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('sadness', 'mood', 'checkIn:symptoms.sadness', 200, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('brain_fog', 'mood', 'checkIn:symptoms.brainFog', 210, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('dizziness', 'body', 'checkIn:symptoms.dizziness', 220, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('ovulation_pain', 'pain', 'checkIn:symptoms.ovulationPain', 230, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('spotting', 'bleeding', 'checkIn:symptoms.spotting', 240, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('heavy_bleeding', 'bleeding', 'checkIn:symptoms.heavyBleeding', 250, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('clots', 'bleeding', 'checkIn:symptoms.clots', 260, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('hot_flashes', 'body', 'checkIn:symptoms.hotFlashes', 270, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('chills', 'body', 'checkIn:symptoms.chills', 280, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('vulvar_discomfort', 'sexual_health', 'checkIn:symptoms.vulvarDiscomfort', 290, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
('vaginal_dryness', 'sexual_health', 'checkIn:symptoms.vaginalDryness', 300, 0, 1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), strftime('%Y-%m-%dT%H:%M:%SZ', 'now'));

CREATE TABLE IF NOT EXISTS medication_catalog (
    id               TEXT PRIMARY KEY NOT NULL, -- UUIDv7 generated on client.
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

CREATE TABLE IF NOT EXISTS checkins (
    id                      TEXT PRIMARY KEY NOT NULL, -- UUIDv7 generated on client.
    user_id                 TEXT NOT NULL,
    recorded_at             TEXT NOT NULL,
    local_date              TEXT NOT NULL,
    bleeding_intensity      INTEGER CHECK (bleeding_intensity BETWEEN 0 AND 4),
    clots                   INTEGER CHECK (clots BETWEEN 0 AND 3),
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

CREATE TABLE IF NOT EXISTS checkin_medications (
    id             TEXT PRIMARY KEY NOT NULL, -- UUIDv7 generated on client.
    checkin_id     TEXT NOT NULL,
    medication_id  TEXT NOT NULL,
    taken_at       TEXT NOT NULL,
    relief         INTEGER NOT NULL CHECK (relief BETWEEN 0 AND 2),
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

CREATE TABLE IF NOT EXISTS daily_summary (
    local_date                  TEXT NOT NULL,
    user_id                     TEXT NOT NULL,
    is_menstruation_day         INTEGER NOT NULL DEFAULT 0 CHECK (is_menstruation_day IN (0, 1)),
    menstruation_basis          TEXT NOT NULL DEFAULT 'none'
                                    CHECK (menstruation_basis IN ('none', 'confirmed_period', 'inferred_bleeding')),
    is_spotting_day             INTEGER NOT NULL DEFAULT 0 CHECK (is_spotting_day IN (0, 1)),
    had_medication              INTEGER NOT NULL DEFAULT 0 CHECK (had_medication IN (0, 1)),
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

CREATE TABLE IF NOT EXISTS content_delivery_log (
    id               TEXT PRIMARY KEY NOT NULL, -- UUIDv7 generated on client.
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

INSERT OR IGNORE INTO schema_migrations(version, name, applied_at)
VALUES (1, '0001_init', strftime('%Y-%m-%dT%H:%M:%SZ', 'now'));

COMMIT;

PRAGMA user_version = 1;
