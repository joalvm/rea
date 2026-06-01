import { NotificationCadence } from "@/types/notifications.types";

import db from "../core/database";

const KEY = "notificationCadence";

/** Persiste preferencias actuales de cadencia de recordatorios. */
export async function saveNotificationCadence(cadence: NotificationCadence) {
    await db().runAsync("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)", KEY, JSON.stringify(cadence));
}

/** Carga preferencias de cadencia si ya existen. */
export async function loadNotificationCadence(): Promise<NotificationCadence | null> {
    const row = await db().getFirstAsync<{ value: string }>("SELECT value FROM app_settings WHERE key = ?", KEY);
    if (!row) {
        return null;
    }

    return JSON.parse(row.value) as NotificationCadence;
}
