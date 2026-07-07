import { relations, sql } from "drizzle-orm";
import { check, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { contraceptionMethodValues, regularityValues, reproductiveModeValues } from "@/db/enums/reproductiveMode";

import { profile } from "./profile";

/**
 * Esquema de la tabla `reproductive_intent_history`, que guarda el historial
 * versionado de intención reproductiva y configuración base del ciclo para el perfil.
 * - `id`: Identificador único del registro histórico.
 * - `profileId`: Perfil propietario. En SQLite conserva la columna legacy `user_id`.
 * - `effectiveFrom`: Fecha local desde la que aplica este estado.
 * - `effectiveTo`: Fecha local hasta la que aplica este estado, si ya fue cerrado.
 * - `reproductiveMode`: Modo de seguimiento vigente (combina tipo + intención en un único eje).
 * - `regularity`, `declaredCycleLength`, `declaredPeriodLength`: Base del ciclo declarada.
 *   NULL en `pregnancy_tracking` (no inventamos un ciclo que la usuaria no declaró);
 *   obligatorios en los demás modos.
 * - `contraceptionMethod`: Método anticonceptivo declarado, o NULL si prefirió no decirlo.
 *   `none` es una elección explícita distinta de "no dijo". Excluyente con `tracking_ttc`
 *   para métodos hormonales.
 * - `createdAt`, `updatedAt`, `deletedAt`: Auditoría local y borrado lógico.
 * - `version`: Versión optimista del registro.
 *
 * La tabla limita valores cerrados, valida rangos biológicos razonables y asegura
 * que las fechas declaradas tengan forma `YYYY-MM-DD`, orden cronológico válido y
 * una sola fila vigente por perfil.
 */
export const reproductiveIntentHistory = sqliteTable(
    "reproductive_intent_history",
    {
        id: text("id").primaryKey().notNull(),
        profileId: text("user_id")
            .notNull()
            .references(() => profile.id, { onDelete: "cascade" }),
        effectiveFrom: text("effective_from").notNull(),
        effectiveTo: text("effective_to"),
        reproductiveMode: text("reproductive_mode", { enum: reproductiveModeValues }).notNull(),
        regularity: text("regularity", { enum: regularityValues }),
        contraceptionMethod: text("contraception_method", { enum: contraceptionMethodValues }),
        declaredCycleLength: integer("declared_cycle_length"),
        declaredPeriodLength: integer("declared_period_length"),
        createdAt: text("created_at").notNull(),
        updatedAt: text("updated_at").notNull(),
        deletedAt: text("deleted_at"),
        version: integer("version").notNull().default(1),
    },
    (table) => [
        uniqueIndex("uq_reproductive_intent_single_open")
            .on(table.profileId)
            .where(sql`${table.effectiveTo} IS NULL AND ${table.deletedAt} IS NULL`),
        check(
            "reproductive_mode_check",
            sql`${table.reproductiveMode} IN ('tracking_only', 'tracking_avoid_pregnancy', 'tracking_ttc', 'pregnancy_tracking')`,
        ),
        check(
            "regularity_check",
            sql`${table.regularity} IS NULL OR ${table.regularity} IN ('regular', 'variable', 'irregular')`,
        ),
        check(
            "contraception_method_check",
            sql`${table.contraceptionMethod} IS NULL OR ${table.contraceptionMethod} IN (
                'none', 'pill', 'hormonal_iud', 'copper_iud', 'implant', 'injection', 'ring', 'patch', 'barrier', 'other'
            )`,
        ),
        check(
            "ttc_hormonal_contraception_exclusion_check",
            sql`NOT (${table.reproductiveMode} = 'tracking_ttc' AND ${table.contraceptionMethod} IN (
                'pill', 'hormonal_iud', 'implant', 'injection', 'ring', 'patch'
            ))`,
        ),
        check(
            "declared_cycle_length_check",
            sql`${table.declaredCycleLength} IS NULL OR ${table.declaredCycleLength} BETWEEN 15 AND 90`,
        ),
        check(
            "declared_period_length_check",
            sql`${table.declaredPeriodLength} IS NULL OR ${table.declaredPeriodLength} BETWEEN 1 AND 15`,
        ),
        check(
            "cycle_fields_pregnancy_nullability_check",
            sql`(${table.reproductiveMode} = 'pregnancy_tracking'
                AND ${table.regularity} IS NULL
                AND ${table.declaredCycleLength} IS NULL
                AND ${table.declaredPeriodLength} IS NULL)
            OR
            (${table.reproductiveMode} != 'pregnancy_tracking'
                AND ${table.regularity} IS NOT NULL
                AND ${table.declaredCycleLength} IS NOT NULL
                AND ${table.declaredPeriodLength} IS NOT NULL)`,
        ),
        check("effective_from_format_check", sql`${table.effectiveFrom} LIKE '____-__-__'`),
        check("effective_to_format_check", sql`${table.effectiveTo} IS NULL OR ${table.effectiveTo} LIKE '____-__-__'`),
        check(
            "effective_range_check",
            sql`${table.effectiveTo} IS NULL OR ${table.effectiveTo} >= ${table.effectiveFrom}`,
        ),
    ],
);

export const reproductiveIntentHistoryRelations = relations(reproductiveIntentHistory, ({ one }) => ({
    profile: one(profile, {
        fields: [reproductiveIntentHistory.profileId],
        references: [profile.id],
    }),
}));

/** Tipo que representa un registro histórico de intención reproductiva al leer desde la base de datos. */
export type ReproductiveIntentHistory = typeof reproductiveIntentHistory.$inferSelect;

/** Tipo para insertar un registro histórico de intención reproductiva. */
export type InsertReproductiveIntentHistory = typeof reproductiveIntentHistory.$inferInsert;

/** Tipo para actualizar un registro histórico sin modificar identidad ni auditoría base. */
export type UpdateReproductiveIntentHistory = Partial<
    Omit<ReproductiveIntentHistory, "id" | "createdAt" | "updatedAt">
>;
