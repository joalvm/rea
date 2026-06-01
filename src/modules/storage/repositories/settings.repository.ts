import { AppSettings } from "@/types/settings.types";

import db from "../core/database";

type LegacyGoal = "full_picture" | "self_knowledge" | "trying_to_conceive" | "track_only";

type StoredSettings = AppSettings | LegacyStoredSettings;

interface LegacyStoredSettings extends Omit<AppSettings, "tryingToConceive"> {
    tryingToConceive?: boolean;
    goal?: LegacyGoal;
    goals?: LegacyGoal[];
}

/** Carga configuración persistida de aplicación si existe. */
export async function loadSettings(): Promise<AppSettings | null> {
    const row = await db().getFirstAsync<{ value: string }>("SELECT value FROM app_settings WHERE key = ?", "settings");
    if (!row) {
        return null;
    }

    return normalizeSettings(JSON.parse(row.value) as StoredSettings);
}

/** Persiste configuración principal y estado de onboarding. */
export async function saveSettings(settings: AppSettings) {
    const normalizedSettings = normalizeSettings(settings);

    await db().runAsync(
        "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)",
        "settings",
        JSON.stringify(normalizedSettings),
    );
}

function normalizeSettings(settings: StoredSettings): AppSettings {
    return {
        onboarded: settings.onboarded,
        lastPeriodStart: settings.lastPeriodStart,
        cycleLength: settings.cycleLength,
        periodLength: settings.periodLength,
        regularity: settings.regularity,
        hormonalContraception: settings.hormonalContraception,
        tryingToConceive: normalizeTryingToConceive(settings),
        createdAt: settings.createdAt,
    };
}

function normalizeTryingToConceive(settings: StoredSettings) {
    if (typeof settings.tryingToConceive === "boolean") {
        return settings.tryingToConceive;
    }

    if ("goals" in settings && Array.isArray(settings.goals)) {
        return settings.goals.includes("trying_to_conceive");
    }

    switch ("goal" in settings ? settings.goal : undefined) {
        case "full_picture":
        case "trying_to_conceive":
            return true;
        case "track_only":
        case "self_knowledge":
        default:
            return false;
    }
}
