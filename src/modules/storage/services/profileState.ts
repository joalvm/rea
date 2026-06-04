import { NotificationCadence } from "@/types/notifications.types";
import { AppSettings } from "@/types/settings.types";

import getDatabase from "../connection";
import createUuidV7 from "../utils/createUuidV7";

interface ActiveProfileRow {
    id: string;
}

/** Persiste onboarding inicial en tablas normalizadas de perfil, intencion y periodo confirmado. */
export async function completeUserProfile(settings: AppSettings, cadence: NotificationCadence) {
    const database = await getDatabase();
    const now = new Date().toISOString();
    const profileId = createUuidV7();

    await database.withExclusiveTransactionAsync(async (transaction) => {
        await transaction.runAsync(
            `INSERT INTO user_profile (
                id,
                reminders_enabled,
                reminder_interval_hours,
                reminder_window_start,
                reminder_window_end,
                created_at,
                updated_at,
                version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
            profileId,
            cadence.enabled ? 1 : 0,
            cadence.intervalHours,
            cadence.activeWindowStart,
            cadence.activeWindowEnd,
            now,
            now,
        );
        await transaction.runAsync(
            `INSERT INTO reproductive_intent_history (
                id,
                user_id,
                effective_from,
                effective_to,
                regularity,
                trying_to_conceive,
                hormonal_contraception,
                declared_cycle_length,
                declared_period_length,
                created_at,
                updated_at,
                version
            ) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, 1)`,
            createUuidV7(),
            profileId,
            settings.lastPeriodStart,
            settings.regularity,
            settings.tryingToConceive ? 1 : 0,
            settings.hormonalContraception ? 1 : 0,
            settings.cycleLength,
            settings.periodLength,
            now,
            now,
        );
        await transaction.runAsync(
            `INSERT INTO period_runs (
                id,
                user_id,
                start_date,
                end_date,
                status,
                source,
                created_at,
                updated_at,
                version
            ) VALUES (?, ?, ?, NULL, 'open', 'user_confirmed', ?, ?, 1)`,
            createUuidV7(),
            profileId,
            settings.lastPeriodStart,
            now,
            now,
        );
    });
}

/** Actualiza preferencias de recordatorio sin guardar historial tecnico de notificaciones. */
export async function saveReminderPreferences(cadence: NotificationCadence) {
    const database = await getDatabase();
    const profile = await getActiveProfileId();
    if (!profile) {
        return;
    }

    await database.runAsync(
        `UPDATE user_profile
         SET reminders_enabled = ?,
             reminder_interval_hours = ?,
             reminder_window_start = ?,
             reminder_window_end = ?,
             updated_at = ?,
             version = version + 1
         WHERE id = ?`,
        cadence.enabled ? 1 : 0,
        cadence.intervalHours,
        cadence.activeWindowStart,
        cadence.activeWindowEnd,
        new Date().toISOString(),
        profile,
    );
}

/** Guarda cambio de enfoque reproductivo como nuevo contexto activo. */
export async function saveUserSettings(settings: AppSettings) {
    const database = await getDatabase();
    const profileId = await getActiveProfileId();
    if (!profileId) {
        return;
    }

    const now = new Date().toISOString();
    await database.withExclusiveTransactionAsync(async (transaction) => {
        await transaction.runAsync(
            `UPDATE reproductive_intent_history
             SET effective_to = ?, updated_at = ?, version = version + 1
             WHERE user_id = ? AND effective_to IS NULL AND deleted_at IS NULL`,
            settings.lastPeriodStart,
            now,
            profileId,
        );
        await transaction.runAsync(
            `INSERT INTO reproductive_intent_history (
                id,
                user_id,
                effective_from,
                effective_to,
                regularity,
                trying_to_conceive,
                hormonal_contraception,
                declared_cycle_length,
                declared_period_length,
                created_at,
                updated_at,
                version
            ) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, 1)`,
            createUuidV7(),
            profileId,
            settings.lastPeriodStart,
            settings.regularity,
            settings.tryingToConceive ? 1 : 0,
            settings.hormonalContraception ? 1 : 0,
            settings.cycleLength,
            settings.periodLength,
            now,
            now,
        );
    });
}

/** Devuelve usuario local unico usado por repositorios canonicos. */
export async function getActiveProfileId() {
    const database = await getDatabase();
    const row = await database.getFirstAsync<ActiveProfileRow>(
        "SELECT id FROM user_profile ORDER BY created_at ASC LIMIT 1",
    );

    return row?.id ?? null;
}
