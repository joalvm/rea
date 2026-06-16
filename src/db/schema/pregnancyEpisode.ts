import { relations, sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { profile } from "./profile";

const pregnancyOutcomeValues = ["birth", "loss", "other"] as const;

/**
 * Esquema de la tabla `pregnancy_episodes`, episodios de embarazo que pausan
 * las estimaciones de ciclo mientras permanecen vigentes.
 * - `id`: Identificador único del episodio.
 * - `profileId`: Perfil propietario. En SQLite conserva la columna legacy `user_id`.
 * - `startDate`: Fecha local de inicio declarada o confirmada.
 * - `endDate`: Fecha local de fin, si el episodio ya cerró.
 * - `outcome`: Desenlace del episodio (`birth`, `loss`, `other`), solo al cerrar.
 * - `note`: Nota opcional de contexto.
 * - `createdAt`, `updatedAt`, `deletedAt`: Auditoría local y borrado lógico.
 * - `version`: Versión optimista del registro.
 *
 * La tabla conserva cronología por perfil, evita más de un embarazo en curso y
 * obliga coherencia entre fechas y desenlace.
 */
export const pregnancyEpisode = sqliteTable(
    "pregnancy_episodes",
    {
        id: text("id").primaryKey().notNull(),
        profileId: text("user_id")
            .notNull()
            .references(() => profile.id, { onDelete: "cascade" }),
        startDate: text("start_date").notNull(),
        endDate: text("end_date"),
        outcome: text("outcome", { enum: pregnancyOutcomeValues }),
        note: text("note"),
        createdAt: text("created_at").notNull(),
        updatedAt: text("updated_at").notNull(),
        deletedAt: text("deleted_at"),
        version: integer("version").notNull().default(1),
    },
    (table) => [
        index("ix_pregnancy_chronological").on(table.profileId, sql`${table.startDate} DESC`),
        uniqueIndex("uq_pregnancy_single_ongoing")
            .on(table.profileId)
            .where(sql`${table.endDate} IS NULL AND ${table.deletedAt} IS NULL`),
        check(
            "pregnancy_outcome_check",
            sql`${table.outcome} IN ('birth', 'loss', 'other') OR ${table.outcome} IS NULL`,
        ),
        check("pregnancy_start_date_check", sql`${table.startDate} LIKE '____-__-__'`),
        check("pregnancy_end_date_check", sql`${table.endDate} IS NULL OR ${table.endDate} LIKE '____-__-__'`),
        check("pregnancy_date_range_check", sql`${table.endDate} IS NULL OR ${table.endDate} >= ${table.startDate}`),
        check("pregnancy_open_outcome_check", sql`${table.endDate} IS NOT NULL OR ${table.outcome} IS NULL`),
    ],
);

export const pregnancyEpisodeRelations = relations(pregnancyEpisode, ({ one }) => ({
    profile: one(profile, {
        fields: [pregnancyEpisode.profileId],
        references: [profile.id],
    }),
}));

/** Tipo que representa un episodio de embarazo al leer desde la base de datos. */
export type PregnancyEpisode = typeof pregnancyEpisode.$inferSelect;

/** Tipo para insertar un episodio de embarazo. */
export type InsertPregnancyEpisode = typeof pregnancyEpisode.$inferInsert;

/** Tipo para actualizar un episodio sin modificar identidad ni auditoría base. */
export type UpdatePregnancyEpisode = Partial<Omit<PregnancyEpisode, "id" | "createdAt" | "updatedAt">>;
