import type { DatabaseSeederConnection } from "./types";

const currentTimestampSql = "strftime('%Y-%m-%dT%H:%M:%SZ', 'now')";
const sourceId = "source-pregnancy-health";

const rangeSeeds = [
    ["01_04", 1, 4],
    ["05_08", 5, 8],
    ["09_12", 9, 12],
    ["13_16", 13, 16],
    ["17_20", 17, 20],
    ["21_24", 21, 24],
    ["25_28", 25, 28],
    ["29_32", 29, 32],
    ["33_36", 33, 36],
    ["37_40", 37, 40],
    ["41_42", 41, 42],
] as const;

const locales = ["es", "en"] as const;

function escapeSqlString(value: string) {
    return `'${value.replaceAll("'", "''")}'`;
}

function buildSourceSql() {
    return `
        INSERT INTO content_sources (id, label_key, reference_key, source_type, reviewed_at, created_at, updated_at)
        VALUES (
            ${escapeSqlString(sourceId)},
            'content:sources.pregnancy.label',
            'content:sources.pregnancy.reference',
            'clinical_education',
            '2026-07-29',
            ${currentTimestampSql},
            ${currentTimestampSql}
        )
        ON CONFLICT(id) DO UPDATE SET
            label_key = excluded.label_key,
            reference_key = excluded.reference_key,
            source_type = excluded.source_type,
            reviewed_at = excluded.reviewed_at,
            updated_at = excluded.updated_at;
    `.trim();
}

function buildItemRowsSql() {
    return locales
        .flatMap((locale) =>
            rangeSeeds.map(([range]) => {
                const baseId = `pregnancy_${range}`;
                const id = `${baseId}_${locale}`;
                return `(
                    ${escapeSqlString(id)}, 'educational', 'pregnancy_week',
                    'content:items.${baseId}.title', 'content:items.${baseId}.body', NULL,
                    'pregnancy_tracking', 10, ${escapeSqlString(locale)}, ${escapeSqlString(sourceId)},
                    '1', 1, NULL, NULL, '2026-07-29', ${currentTimestampSql}, ${currentTimestampSql}
                )`;
            }),
        )
        .join(",\n");
}

function buildRuleRowsSql() {
    return locales
        .flatMap((locale) =>
            rangeSeeds.map(([range, minWeek, maxWeek]) => {
                const itemId = `pregnancy_${range}_${locale}`;
                return `(
                    ${escapeSqlString(`${itemId}_week_rule`)}, ${escapeSqlString(itemId)}, 'pregnancy_week',
                    'week', ${minWeek}, ${maxWeek}, NULL, 10, ${currentTimestampSql}, ${currentTimestampSql}
                )`;
            }),
        )
        .join(",\n");
}

/** Seeder editorial idempotente: corpus mínimo de embarazo, bilingüe y con fuente por fila. */
export async function seedContentCatalog(database: DatabaseSeederConnection) {
    await database.execAsync(buildSourceSql());
    await database.execAsync(
        `
        INSERT INTO content_items (
            id, content_type, topic, title_key, body_key, min_confidence, target_mode,
            priority, locale, source_id, content_version, is_active, valid_from, valid_until,
            reviewed_at, created_at, updated_at
        ) VALUES ${buildItemRowsSql()}
        ON CONFLICT(id) DO UPDATE SET
            title_key = excluded.title_key,
            body_key = excluded.body_key,
            target_mode = excluded.target_mode,
            priority = excluded.priority,
            locale = excluded.locale,
            source_id = excluded.source_id,
            content_version = excluded.content_version,
            is_active = excluded.is_active,
            reviewed_at = excluded.reviewed_at,
            updated_at = excluded.updated_at;
    `.trim(),
    );
    await database.execAsync(
        `
        INSERT INTO content_rules (
            id, content_item_id, trigger_type, trigger_key, min_value, max_value,
            required_value, priority, created_at, updated_at
        ) VALUES ${buildRuleRowsSql()}
        ON CONFLICT(id) DO UPDATE SET
            content_item_id = excluded.content_item_id,
            trigger_type = excluded.trigger_type,
            trigger_key = excluded.trigger_key,
            min_value = excluded.min_value,
            max_value = excluded.max_value,
            priority = excluded.priority,
            updated_at = excluded.updated_at;
    `.trim(),
    );
}
