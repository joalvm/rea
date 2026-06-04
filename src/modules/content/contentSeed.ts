import * as SQLite from "expo-sqlite";

import contentCatalog from "./contentCatalog";
import contentRuleCatalog from "./contentRuleCatalog";
import contentSourceCatalog from "./contentSourceCatalog";

/** Reaplica catalogos editoriales locales sin duplicar filas ni guardar copy visible en SQLite. */
export default async function seedContentCatalogs(database: SQLite.SQLiteDatabase) {
    const now = new Date().toISOString();

    await database.withExclusiveTransactionAsync(async (transaction) => {
        for (const source of contentSourceCatalog) {
            await transaction.runAsync(
                `INSERT INTO content_sources (
                    id,
                    label_key,
                    reference_key,
                    source_url,
                    source_type,
                    reviewed_at,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    label_key = excluded.label_key,
                    reference_key = excluded.reference_key,
                    source_url = excluded.source_url,
                    source_type = excluded.source_type,
                    reviewed_at = excluded.reviewed_at,
                    updated_at = excluded.updated_at`,
                source.id,
                source.label_key,
                source.reference_key,
                source.source_url,
                source.source_type,
                source.reviewed_at,
                now,
                now,
            );
        }

        for (const item of contentCatalog) {
            await transaction.runAsync(
                `INSERT INTO content_items (
                    id,
                    content_type,
                    topic,
                    title_key,
                    body_key,
                    min_confidence,
                    priority,
                    locale,
                    source_id,
                    content_version,
                    is_active,
                    reviewed_at,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    content_type = excluded.content_type,
                    topic = excluded.topic,
                    title_key = excluded.title_key,
                    body_key = excluded.body_key,
                    min_confidence = excluded.min_confidence,
                    priority = excluded.priority,
                    locale = excluded.locale,
                    source_id = excluded.source_id,
                    content_version = excluded.content_version,
                    is_active = excluded.is_active,
                    reviewed_at = excluded.reviewed_at,
                    updated_at = excluded.updated_at`,
                item.id,
                item.content_type,
                item.topic,
                item.title_key,
                item.body_key,
                item.min_confidence,
                item.priority,
                item.locale,
                item.source_id,
                item.content_version,
                item.reviewed_at,
                now,
                now,
            );
        }

        for (const rule of contentRuleCatalog) {
            await transaction.runAsync(
                `INSERT INTO content_rules (
                    id,
                    content_item_id,
                    trigger_type,
                    trigger_key,
                    min_value,
                    max_value,
                    required_value,
                    priority,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    content_item_id = excluded.content_item_id,
                    trigger_type = excluded.trigger_type,
                    trigger_key = excluded.trigger_key,
                    min_value = excluded.min_value,
                    max_value = excluded.max_value,
                    required_value = excluded.required_value,
                    priority = excluded.priority,
                    updated_at = excluded.updated_at`,
                rule.id,
                rule.content_item_id,
                rule.trigger_type,
                rule.trigger_key,
                rule.min_value,
                rule.max_value,
                rule.required_value,
                rule.priority,
                now,
                now,
            );
        }
    });
}
