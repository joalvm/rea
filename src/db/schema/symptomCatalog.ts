import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { reproductiveModeFilterValues } from "@/db/enums/reproductiveMode";
import { symptomGroupValues } from "@/db/enums/symptomCatalog";

/**
 * Esquema de la tabla `symptom_catalog`, catálogo local de síntomas disponibles.
 * - `symptomKey`: Clave estable del síntoma, usada también por traducciones.
 * - `groupKey`: Grupo funcional del síntoma.
 * - `labelKey`: Clave i18n para mostrar el nombre del síntoma.
 * - `applicableMode`: Filtra si el síntoma aplica por modo reproductivo.
 * - `uiPriority`: Prioridad de ordenamiento para UI.
 * - `isQuickOption`: Indica si el síntoma aparece como opción rápida.
 * - `isActive`: Permite retirar síntomas sin romper histórico.
 * - `createdAt`, `updatedAt`: Auditoría local del catálogo.
 *
 * La tabla limita los grupos permitidos y guarda solo claves, no texto visible.
 */
export const symptomCatalog = sqliteTable(
    "symptom_catalog",
    {
        symptomKey: text("symptom_key").primaryKey().notNull(),
        groupKey: text("group_key", { enum: symptomGroupValues }).notNull(),
        labelKey: text("label_key").notNull(),
        applicableMode: text("applicable_mode", { enum: reproductiveModeFilterValues }).notNull().default("all"),
        uiPriority: integer("ui_priority").notNull().default(100),
        isQuickOption: integer("is_quick_option", { mode: "boolean" }).notNull().default(false),
        isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
        createdAt: text("created_at").notNull(),
        updatedAt: text("updated_at").notNull(),
    },
    (table) => [
        check(
            "symptom_group_key_check",
            sql`${table.groupKey} IN ('pain', 'digestive', 'skin', 'sleep', 'mood', 'energy', 'bleeding', 'body', 'sexual_health', 'other')`,
        ),
        check(
            "symptom_applicable_mode_check",
            sql`${table.applicableMode} IN ('tracking_only', 'tracking_avoid_pregnancy', 'tracking_ttc', 'pregnancy_tracking', 'all')`,
        ),
        check("symptom_quick_option_check", sql`${table.isQuickOption} IN (0, 1)`),
        check("symptom_active_check", sql`${table.isActive} IN (0, 1)`),
    ],
);

/** Tipo que representa un síntoma del catálogo al leer desde la base de datos. */
export type SymptomCatalog = typeof symptomCatalog.$inferSelect;

/** Tipo para insertar un síntoma en el catálogo local. */
export type InsertSymptomCatalog = typeof symptomCatalog.$inferInsert;

/** Tipo para actualizar un síntoma del catálogo sin modificar su clave ni auditoría base. */
export type UpdateSymptomCatalog = Partial<Omit<SymptomCatalog, "symptomKey" | "createdAt" | "updatedAt">>;
