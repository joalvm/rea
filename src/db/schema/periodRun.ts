import { relations, sql } from "drizzle-orm";
import { check, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { periodRunSourceValues, periodRunStatusValues } from "@/db/enums/periodRun";

import { profile } from "./profile";

/**
 * Esquema de la tabla `period_runs`, que almacena tramos continuos de menstruación
 * normalizados a partir de confirmaciones o inferencias.
 * - `id`: Identificador único del tramo.
 * - `profileId`: Perfil propietario. En SQLite conserva la columna legacy `user_id`.
 * - `startDate`: Fecha local de inicio del tramo.
 * - `endDate`: Fecha local de cierre, si el tramo ya terminó.
 * - `status`: Estado operativo del tramo (`open`, `closed`, `excluded`).
 * - `source`: Origen del tramo (`user_confirmed`, `bleeding_inferred`, `mixed`).
 * - `createdAt`, `updatedAt`, `deletedAt`: Auditoría local y borrado lógico.
 * - `version`: Versión optimista del registro.
 *
 * La tabla evita duplicar tramos activos por fecha de inicio, mantiene búsqueda
 * cronológica por perfil, garantiza a lo sumo un tramo abierto por perfil y valida
 * forma `YYYY-MM-DD` con orden entre inicio y fin.
 */
export const periodRun = sqliteTable(
    "period_runs",
    {
        id: text("id").primaryKey().notNull(),
        profileId: text("user_id")
            .notNull()
            .references(() => profile.id, { onDelete: "cascade" }),
        startDate: text("start_date").notNull(),
        endDate: text("end_date"),
        status: text("status", { enum: periodRunStatusValues }).notNull().default("open"),
        source: text("source", { enum: periodRunSourceValues }).notNull().default("user_confirmed"),
        createdAt: text("created_at").notNull(),
        updatedAt: text("updated_at").notNull(),
        deletedAt: text("deleted_at"),
        version: integer("version").notNull().default(1),
    },
    (table) => [
        uniqueIndex("uq_period_runs_start_active")
            .on(table.profileId, table.startDate)
            .where(sql`${table.deletedAt} IS NULL`),
        uniqueIndex("uq_period_runs_single_open")
            .on(table.profileId)
            .where(sql`${table.status} = 'open' AND ${table.deletedAt} IS NULL`),
        check("period_run_status_check", sql`${table.status} IN ('open', 'closed', 'excluded')`),
        check("period_run_source_check", sql`${table.source} IN ('user_confirmed', 'bleeding_inferred', 'mixed')`),
        check("period_run_start_date_format_check", sql`${table.startDate} LIKE '____-__-__'`),
        check("period_run_end_date_format_check", sql`${table.endDate} IS NULL OR ${table.endDate} LIKE '____-__-__'`),
        check("period_run_date_range_check", sql`${table.endDate} IS NULL OR ${table.endDate} >= ${table.startDate}`),
    ],
);

export const periodRunRelations = relations(periodRun, ({ one }) => ({
    profile: one(profile, {
        fields: [periodRun.profileId],
        references: [profile.id],
    }),
}));

/** Tipo que representa un tramo menstrual completo al leer desde la base de datos. */
export type PeriodRun = typeof periodRun.$inferSelect;

/** Tipo para insertar un tramo menstrual. */
export type InsertPeriodRun = typeof periodRun.$inferInsert;

/** Tipo para actualizar un tramo menstrual sin modificar identidad ni auditoría base. */
export type UpdatePeriodRun = Partial<Omit<PeriodRun, "id" | "createdAt" | "updatedAt">>;
