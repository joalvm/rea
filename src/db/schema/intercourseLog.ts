import { relations, sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { profile } from "./profile";

/**
 * Esquema de la tabla `intercourse_log`, eventos de relaciones sexuales como
 * entidad de primera clase, separados de `checkins`.
 * - `id`: Identificador único del evento.
 * - `profileId`: Perfil propietario. En SQLite conserva la columna legacy `user_id`.
 * - `occurredAt`: Timestamp exacto del evento.
 * - `localDate`: Día local materializado para búsquedas y agregados.
 * - `isProtected`: Si hubo protección (`true`, `false`) o no se especificó (`null`).
 * - `inFertileWindow`: Marcador analítico calculado por la app, si aplica.
 * - `createdAt`, `updatedAt`, `deletedAt`: Auditoría local y borrado lógico.
 * - `version`: Versión optimista del registro.
 *
 * La tabla existe por separado porque un evento sexual puede ocurrir sin check-in,
 * varias veces por día y con semántica distinta a una sensación o síntoma.
 */
export const intercourseLog = sqliteTable(
    "intercourse_log",
    {
        id: text("id").primaryKey().notNull(),
        profileId: text("user_id")
            .notNull()
            .references(() => profile.id, { onDelete: "cascade" }),
        occurredAt: text("occurred_at").notNull(),
        localDate: text("local_date").notNull(),
        isProtected: integer("protected", { mode: "boolean" }),
        inFertileWindow: integer("in_fertile_window", { mode: "boolean" }),
        createdAt: text("created_at").notNull(),
        updatedAt: text("updated_at").notNull(),
        deletedAt: text("deleted_at"),
        version: integer("version").notNull().default(1),
    },
    (table) => [
        index("ix_intercourse_log_date").on(table.profileId, table.localDate, table.deletedAt),
        check("intercourse_local_date_check", sql`${table.localDate} LIKE '____-__-__'`),
        check("intercourse_protected_check", sql`${table.isProtected} IN (0, 1) OR ${table.isProtected} IS NULL`),
        check(
            "intercourse_in_fertile_window_check",
            sql`${table.inFertileWindow} IN (0, 1) OR ${table.inFertileWindow} IS NULL`,
        ),
    ],
);

export const intercourseLogRelations = relations(intercourseLog, ({ one }) => ({
    profile: one(profile, {
        fields: [intercourseLog.profileId],
        references: [profile.id],
    }),
}));

/** Tipo que representa un evento sexual al leer desde la base de datos. */
export type IntercourseLog = typeof intercourseLog.$inferSelect;

/** Tipo para insertar un evento sexual. */
export type InsertIntercourseLog = typeof intercourseLog.$inferInsert;

/** Tipo para actualizar un evento sexual sin modificar identidad ni auditoría base. */
export type UpdateIntercourseLog = Partial<Omit<IntercourseLog, "id" | "createdAt" | "updatedAt">>;
