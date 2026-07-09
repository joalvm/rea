import { relations, sql } from "drizzle-orm";
import { check, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { datingBasisValues, pregnancyOutcomeValues } from "@/db/enums/pregnancyEpisode";

import { profile } from "./profile";

/**
 * Esquema de la tabla `pregnancy_episodes`, episodios de embarazo que pausan
 * las estimaciones de ciclo mientras permanecen vigentes.
 * - `id`: Identificador único del episodio.
 * - `profileId`: Perfil propietario. En SQLite conserva la columna legacy `user_id`.
 * - `lmpDate`: Fecha de última menstruación usada como base del embarazo.
 * - `dueDate`: Fecha probable de parto, si se conoce.
 * - `datingBasis`: Qué dato declaró realmente la usuaria (`lmp` o `due_date`); el otro
 *   se deriva. Procedencia honesta de la semana gestacional mostrada.
 * - `endDate`: Fecha local de fin, si el episodio ya cerró.
 * - `outcome`: Desenlace del episodio (`birth`, `loss`, `other`), solo al cerrar.
 * - `outcomeDetails`: Nota opcional de contexto del desenlace.
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
        lmpDate: text("lmp_date").notNull(),
        dueDate: text("due_date"),
        datingBasis: text("dating_basis", { enum: datingBasisValues }).notNull().default("lmp"),
        endDate: text("end_date"),
        outcome: text("outcome", { enum: pregnancyOutcomeValues }),
        outcomeDetails: text("outcome_details"),
        createdAt: text("created_at").notNull(),
        updatedAt: text("updated_at").notNull(),
        deletedAt: text("deleted_at"),
        version: integer("version").notNull().default(1),
    },
    (table) => [
        uniqueIndex("uq_pregnancy_single_ongoing")
            .on(table.profileId)
            .where(sql`${table.endDate} IS NULL AND ${table.deletedAt} IS NULL`),
        check("pregnancy_dating_basis_check", sql`${table.datingBasis} IN ('lmp', 'due_date', 'ultrasound')`),
        check(
            "pregnancy_outcome_check",
            sql`${table.outcome} IN ('birth', 'loss', 'other') OR ${table.outcome} IS NULL`,
        ),
        check("pregnancy_lmp_date_check", sql`${table.lmpDate} LIKE '____-__-__'`),
        check("pregnancy_end_date_check", sql`${table.endDate} IS NULL OR ${table.endDate} LIKE '____-__-__'`),
        check("pregnancy_date_range_check", sql`${table.endDate} IS NULL OR ${table.endDate} >= ${table.lmpDate}`),
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
