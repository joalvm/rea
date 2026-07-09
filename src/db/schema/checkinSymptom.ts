import { relations, sql } from "drizzle-orm";
import { check, index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { checkin } from "./checkin";
import { symptomCatalog } from "./symptomCatalog";

/**
 * Esquema de la tabla `checkin_symptoms`, asociación entre un check-in y los
 * síntomas marcados en ese registro.
 * - `checkinId`: Check-in propietario.
 * - `symptomKey`: Síntoma seleccionado desde `symptom_catalog`.
 * - `intensity`: Intensidad reportada del síntoma, entre 1 y 5.
 * - `createdAt`, `updatedAt`, `deletedAt`: Auditoría local y borrado lógico.
 * - `version`: Versión optimista del registro.
 *
 * La clave primaria compuesta evita duplicar el mismo síntoma dentro de un check-in.
 * El índice por síntoma permite buscar días o registros por intensidad.
 */
export const checkinSymptom = sqliteTable(
    "checkin_symptoms",
    {
        checkinId: text("checkin_id")
            .notNull()
            .references(() => checkin.id, { onDelete: "cascade" }),
        symptomKey: text("symptom_key")
            .notNull()
            .references(() => symptomCatalog.symptomKey),
        intensity: integer("intensity").notNull(),
        createdAt: text("created_at").notNull(),
        updatedAt: text("updated_at").notNull(),
        deletedAt: text("deleted_at"),
        version: integer("version").notNull().default(1),
    },
    (table) => [
        primaryKey({ columns: [table.checkinId, table.symptomKey] }),
        index("ix_checkin_symptoms_lookup").on(table.symptomKey, table.intensity, table.deletedAt),
        check("checkin_symptom_intensity_check", sql`${table.intensity} BETWEEN 1 AND 5`),
    ],
);

export const checkinSymptomRelations = relations(checkinSymptom, ({ one }) => ({
    checkin: one(checkin, {
        fields: [checkinSymptom.checkinId],
        references: [checkin.id],
    }),
    symptom: one(symptomCatalog, {
        fields: [checkinSymptom.symptomKey],
        references: [symptomCatalog.symptomKey],
    }),
}));

/** Tipo que representa un síntoma asociado a un check-in al leer desde la base de datos. */
export type CheckinSymptom = typeof checkinSymptom.$inferSelect;

/** Tipo para insertar un síntoma asociado a un check-in. */
export type InsertCheckinSymptom = typeof checkinSymptom.$inferInsert;

/** Tipo para actualizar intensidad o estado lógico sin modificar la clave compuesta ni auditoría base. */
export type UpdateCheckinSymptom = Partial<
    Omit<CheckinSymptom, "checkinId" | "symptomKey" | "createdAt" | "updatedAt">
>;
