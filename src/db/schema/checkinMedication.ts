import { relations, sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { checkin } from "./checkin";
import { medicationCatalog } from "./medicationCatalog";

/**
 * Esquema de la tabla `checkin_medications`, registro de medicamentos tomados
 * dentro del contexto de un check-in.
 * - `id`: Identificador único de la toma.
 * - `checkinId`: Check-in donde se registró la toma.
 * - `medicationId`: Medicamento del catálogo personal.
 * - `takenAt`: Timestamp declarado de la toma.
 * - `relief`: Nivel de alivio reportado, entre 0 y 2. Opcional: la usuaria puede
 *   registrar la toma sin saber aún si alivió y completarlo después.
 * - `doseNote`: Nota opcional de dosis o contexto.
 * - `createdAt`, `updatedAt`, `deletedAt`: Auditoría local y borrado lógico.
 * - `version`: Versión optimista del registro.
 *
 * La tabla mantiene búsqueda por medicamento y fecha de toma, y valida el rango
 * de alivio para futuras estadísticas.
 */
export const checkinMedication = sqliteTable(
    "checkin_medications",
    {
        id: text("id").primaryKey().notNull(),
        checkinId: text("checkin_id")
            .notNull()
            .references(() => checkin.id, { onDelete: "cascade" }),
        medicationId: text("medication_id")
            .notNull()
            .references(() => medicationCatalog.id),
        takenAt: text("taken_at").notNull(),
        relief: integer("relief"),
        doseNote: text("dose_note"),
        createdAt: text("created_at").notNull(),
        updatedAt: text("updated_at").notNull(),
        deletedAt: text("deleted_at"),
        version: integer("version").notNull().default(1),
    },
    (table) => [
        index("ix_checkin_medications_by_checkin").on(table.checkinId, table.deletedAt),
        index("ix_checkin_medications_lookup").on(table.medicationId, table.takenAt, table.deletedAt),
        check("checkin_medication_relief_check", sql`${table.relief} IS NULL OR (${table.relief} BETWEEN 0 AND 2)`),
    ],
);

export const checkinMedicationRelations = relations(checkinMedication, ({ one }) => ({
    checkin: one(checkin, {
        fields: [checkinMedication.checkinId],
        references: [checkin.id],
    }),
    medication: one(medicationCatalog, {
        fields: [checkinMedication.medicationId],
        references: [medicationCatalog.id],
    }),
}));

/** Tipo que representa una toma de medicamento vinculada a un check-in. */
export type CheckinMedication = typeof checkinMedication.$inferSelect;

/** Tipo para insertar una toma de medicamento. */
export type InsertCheckinMedication = typeof checkinMedication.$inferInsert;

/** Tipo para actualizar una toma de medicamento sin modificar identidad ni auditoría base. */
export type UpdateCheckinMedication = Partial<Omit<CheckinMedication, "id" | "createdAt" | "updatedAt">>;
