import { AppSettings } from "../../../types/settings.types";

import db from "../core/database";

/** Carga configuración persistida de aplicación si existe. */
export async function loadSettings(): Promise<AppSettings | null> {
    const row = await db().getFirstAsync<{ value: string }>("SELECT value FROM app_settings WHERE key = ?", "settings");
    return row ? (JSON.parse(row.value) as AppSettings) : null;
}

/** Persiste configuración principal y estado de onboarding. */
export async function saveSettings(settings: AppSettings) {
    await db().runAsync(
        "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
        "settings",
        JSON.stringify(settings),
    );
}
