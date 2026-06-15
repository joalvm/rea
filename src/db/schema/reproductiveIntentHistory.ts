import { relations, sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { profile } from "./profile";

const regularityValues = ["regular", "variable", "irregular"] as const;

/**
 * Esquema de la tabla `reproductive_intent_history`, que guarda el historial
 * versionado de intención reproductiva y configuración base del ciclo para el perfil.
 * - `id`: Identificador único del registro histórico.
 * - `profileId`: Perfil propietario. En SQLite conserva la columna legacy `user_id`.
 * - `effectiveFrom`: Fecha local desde la que aplica este estado.
 * - `effectiveTo`: Fecha local hasta la que aplica este estado, si ya fue cerrado.
 * - `regularity`: Regularidad declarada del ciclo.
 * - `tryingToConceive`: Indica si la persona está intentando concebir.
 * - `hormonalContraception`: Indica uso declarado de anticoncepción hormonal.
 * - `declaredCycleLength`: Longitud declarada del ciclo, entre 15 y 90 días.
 * - `declaredPeriodLength`: Duración declarada del periodo, entre 1 y 15 días.
 * - `createdAt`, `updatedAt`, `deletedAt`: Auditoría local y borrado lógico.
 * - `version`: Versión optimista del registro.
 *
 * La tabla limita valores cerrados, valida rangos biológicos razonables y asegura
 * que las fechas declaradas tengan forma `YYYY-MM-DD` y orden cronológico válido.
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
        regularity: text("regularity", { enum: regularityValues }).notNull(),
        tryingToConceive: integer("trying_to_conceive", { mode: "boolean" }).notNull(),
        hormonalContraception: integer("hormonal_contraception", { mode: "boolean" }).notNull(),
        declaredCycleLength: integer("declared_cycle_length").notNull(),
        declaredPeriodLength: integer("declared_period_length").notNull(),
        createdAt: text("created_at").notNull(),
        updatedAt: text("updated_at").notNull(),
        deletedAt: text("deleted_at"),
        version: integer("version").notNull().default(1),
    },
    (table) => [
        index("ix_reproductive_intent_active_date").on(
            table.profileId,
            sql`${table.effectiveFrom} DESC`,
            table.effectiveTo,
        ),
        check("regularity_check", sql`${table.regularity} IN ('regular', 'variable', 'irregular')`),
        check("trying_to_conceive_check", sql`${table.tryingToConceive} IN (0, 1)`),
        check("hormonal_contraception_check", sql`${table.hormonalContraception} IN (0, 1)`),
        check("declared_cycle_length_check", sql`${table.declaredCycleLength} BETWEEN 15 AND 90`),
        check("declared_period_length_check", sql`${table.declaredPeriodLength} BETWEEN 1 AND 15`),
        check(
            "effective_from_format_check",
            sql`${table.effectiveFrom} GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'`,
        ),
        check(
            "effective_to_format_check",
            sql`${table.effectiveTo} IS NULL OR ${table.effectiveTo} GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'`,
        ),
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
