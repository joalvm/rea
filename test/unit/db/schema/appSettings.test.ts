import { describe, expect, it } from "@jest/globals";

import { appSettings } from "@/db/schema/appSettings";
import { checkNames, columnNames, foreignKeys, tableName } from "@test/db/utils/schemaMetadata";

describe("Esquema de appSettings", () => {
    it("define el contrato de la tabla app_settings", () => {
        expect(tableName(appSettings)).toBe("app_settings");
        expect(columnNames(appSettings)).toEqual([
            "user_id",
            "reminders_enabled",
            "reminder_interval_hours",
            "reminder_window_start",
            "reminder_window_end",
            "theme",
            "temperature_unit",
            "onboarding_completed_at",
            "created_at",
            "updated_at",
            "version",
        ]);
    });

    it("conserva valores por defecto, restricciones CHECK y clave foránea", () => {
        expect(appSettings.remindersEnabled.default).toBe(true);
        expect(appSettings.reminderIntervalHours.default).toBe(6);
        expect(appSettings.reminderWindowStart.default).toBe("09:00");
        expect(appSettings.reminderWindowEnd.default).toBe("22:00");
        expect(appSettings.theme.default).toBe("system");
        expect(appSettings.temperatureUnit.default).toBe("celsius");
        expect(appSettings.version.default).toBe(1);
        expect(checkNames(appSettings)).toEqual([
            "app_settings_reminders_enabled_check",
            "app_settings_reminder_interval_hours_check",
            "app_settings_reminder_window_start_check",
            "app_settings_reminder_window_end_check",
            "app_settings_reminder_window_order_check",
            "app_settings_theme_check",
            "app_settings_temperature_unit_check",
        ]);
        expect(foreignKeys(appSettings)).toEqual([
            { columns: ["user_id"], foreignColumns: ["id"], foreignTable: "user_profile", onDelete: "cascade" },
        ]);
    });
});
