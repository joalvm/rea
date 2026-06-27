import { relations, sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { appThemeValues, temperatureUnitValues } from "@/db/enums/appSettings";

import { profile } from "./profile";

const defaults = {
    remindersEnabled: true,
    reminderIntervalHours: 6,
    reminderWindowStart: "09:00",
    reminderWindowEnd: "22:00",
    theme: "system" as const,
    temperatureUnit: "celsius" as const,
    version: 1,
};

/**
 * Esquema de la tabla `app_settings`, preferencias locales 1:1 del perfil.
 * - `userId`: Clave primaria y FK al perfil dueño.
 * - Recordatorios: habilitación, intervalo y ventana horaria.
 * - `theme`, `temperatureUnit`: Preferencias de UI y visualización.
 * - `onboardingCompletedAt`: Timestamp opcional de cierre del onboarding.
 * - `createdAt`, `updatedAt`: Auditoría local.
 * - `version`: Versión optimista del registro.
 */
export const appSettings = sqliteTable(
    "app_settings",
    {
        userId: text("user_id")
            .primaryKey()
            .notNull()
            .references(() => profile.id, { onDelete: "cascade" }),
        remindersEnabled: integer("reminders_enabled", { mode: "boolean" })
            .notNull()
            .default(defaults.remindersEnabled),
        reminderIntervalHours: integer("reminder_interval_hours").notNull().default(defaults.reminderIntervalHours),
        reminderWindowStart: text("reminder_window_start").notNull().default(defaults.reminderWindowStart),
        reminderWindowEnd: text("reminder_window_end").notNull().default(defaults.reminderWindowEnd),
        theme: text("theme", { enum: appThemeValues }).notNull().default(defaults.theme),
        temperatureUnit: text("temperature_unit", { enum: temperatureUnitValues })
            .notNull()
            .default(defaults.temperatureUnit),
        onboardingCompletedAt: text("onboarding_completed_at"),
        createdAt: text("created_at").notNull(),
        updatedAt: text("updated_at").notNull(),
        version: integer("version").notNull().default(defaults.version),
    },
    (table) => [
        check("app_settings_reminders_enabled_check", sql`${table.remindersEnabled} IN (0, 1)`),
        check("app_settings_reminder_interval_hours_check", sql`${table.reminderIntervalHours} BETWEEN 1 AND 24`),
        check("app_settings_reminder_window_start_check", sql`${table.reminderWindowStart} LIKE '__:__'`),
        check("app_settings_reminder_window_end_check", sql`${table.reminderWindowEnd} LIKE '__:__'`),
        check("app_settings_theme_check", sql`${table.theme} IN ('system', 'light', 'dark')`),
        check("app_settings_temperature_unit_check", sql`${table.temperatureUnit} IN ('celsius', 'fahrenheit')`),
    ],
);

export const appSettingsRelations = relations(appSettings, ({ one }) => ({
    profile: one(profile, {
        fields: [appSettings.userId],
        references: [profile.id],
    }),
}));

/** Tipo que representa la configuración local de la app al leer desde la base de datos. */
export type AppSettings = typeof appSettings.$inferSelect;

/** Tipo para insertar la configuración local de la app. */
export type InsertAppSettings = typeof appSettings.$inferInsert;

/** Tipo para actualizar la configuración sin modificar identidad ni auditoría base. */
export type UpdateAppSettings = Partial<Omit<AppSettings, "userId" | "createdAt" | "updatedAt">>;
