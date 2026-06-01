import { AppSettings } from "@/types/settings.types";

import db from "../core/database";

type LegacyGoal = "full_picture" | "self_knowledge" | "trying_to_conceive" | "track_only";

type StoredSettings =
    | AppSettings
    | (Omit<AppSettings, "goals"> & {
          goal?: LegacyGoal;
          goals?: AppSettings["goals"];
      });

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
    const goals = normalizeGoals(settings.goals, "goal" in settings ? settings.goal : undefined);

    return {
        onboarded: settings.onboarded,
        lastPeriodStart: settings.lastPeriodStart,
        cycleLength: settings.cycleLength,
        periodLength: settings.periodLength,
        regularity: settings.regularity,
        hormonalContraception: settings.hormonalContraception,
        goals,
        createdAt: settings.createdAt,
    };
}

function normalizeGoals(goals?: AppSettings["goals"], legacyGoal?: LegacyGoal): AppSettings["goals"] {
    if (Array.isArray(goals) && goals.length > 0) {
        return Array.from(new Set(goals.filter((goal) => goal === "self_knowledge" || goal === "trying_to_conceive")));
    }

    switch (legacyGoal) {
        case "full_picture":
            return ["self_knowledge", "trying_to_conceive"];
        case "trying_to_conceive":
            return ["trying_to_conceive"];
        case "track_only":
        case "self_knowledge":
        default:
            return ["self_knowledge"];
    }
}
