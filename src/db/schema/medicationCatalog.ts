import { relations, sql } from "drizzle-orm";
import { check, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

import { profile } from "./profile";

/**
 * Esquema de la tabla `medication_catalog`, catálogo personal de medicamentos
 * registrados por perfil.
 * - `id`: Identificador único del medicamento.
 * - `profileId`: Perfil propietario. En SQLite conserva la columna legacy `user_id`.
 * - `name`: Nombre escrito por la persona.
 * - `normalizedName`: Nombre normalizado para búsquedas y unicidad.
 * - `createdAt`, `updatedAt`, `deletedAt`: Auditoría local y borrado lógico.
 * - `version`: Versión optimista del registro.
 *
 * La tabla exige nombres no vacíos y evita duplicados activos por perfil usando
 * `normalizedName` mientras permite conservar histórico borrado lógicamente.
 */
export const medicationCatalog = sqliteTable(
    "medication_catalog",
    {
        id: text("id").primaryKey().notNull(),
        profileId: text("user_id")
            .notNull()
            .references(() => profile.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        normalizedName: text("normalized_name").notNull(),
        createdAt: text("created_at").notNull(),
        updatedAt: text("updated_at").notNull(),
        deletedAt: text("deleted_at"),
        version: integer("version").notNull().default(1),
    },
    (table) => [
        uniqueIndex("uq_medication_catalog_active_name")
            .on(table.profileId, table.normalizedName)
            .where(sql`${table.deletedAt} IS NULL`),
        check("medication_name_not_empty_check", sql`length(trim(${table.name})) > 0`),
        check("medication_normalized_name_not_empty_check", sql`length(trim(${table.normalizedName})) > 0`),
    ],
);

export const medicationCatalogRelations = relations(medicationCatalog, ({ one }) => ({
    profile: one(profile, {
        fields: [medicationCatalog.profileId],
        references: [profile.id],
    }),
}));

/** Tipo que representa un medicamento personal al leer desde la base de datos. */
export type MedicationCatalog = typeof medicationCatalog.$inferSelect;

/** Tipo para insertar un medicamento personal. */
export type InsertMedicationCatalog = typeof medicationCatalog.$inferInsert;

/** Tipo para actualizar un medicamento personal sin modificar identidad ni auditoría base. */
export type UpdateMedicationCatalog = Partial<Omit<MedicationCatalog, "id" | "createdAt" | "updatedAt">>;
