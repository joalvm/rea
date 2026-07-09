import { relations, sql } from "drizzle-orm";
import { check, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

import { ovulationBasisValues } from "@/db/enums/cycleRecord";

import { profile } from "./profile";

/**
 * Esquema de la tabla `cycle_records`, read model del motor de ciclo: una fila por
 * ciclo **cerrado** (de inicio de regla al día anterior al siguiente inicio).
 * La escribe únicamente el motor (`src/domain/engine/recalculate.ts`) al confirmarse
 * el siguiente inicio; nunca la UI.
 * - `startDate`/`endDate`: Límites del ciclo cerrado.
 * - `cycleLength`/`periodLength`: Duración del ciclo y del sangrado observado.
 * - `ovulationDate`/`ovulationBasis`: Ovulación estimada y evidencia que ganó
 *   (jerarquía BBT > OPK > moco > calendario), o NULL si no hay evidencia.
 * - `lutealLength`: Días entre ovulación e inicio del siguiente ciclo.
 * - `predictedStart`/`predictionErrorDays`: Predicción vigente **antes** de que el
 *   ciclo real empezara y su error en días (real − predicho), para medir precisión.
 * - `isValid`/`excludedReason`: Validez de dominio (15–90 días, ver auditoría A5);
 *   un ciclo fuera de rango igual se guarda, marcado inválido, nunca se descarta.
 * - `createdAt`, `updatedAt`: Auditoría local. Sin `deletedAt`: es historia derivada,
 *   reescrita in-place por el motor ante ediciones retroactivas, no un registro que
 *   la usuaria borre.
 * - `version`: Versión optimista del registro.
 *
 * A lo sumo un registro por perfil y fecha de inicio; el motor reescribe en el
 * mismo `id` si un recálculo retroactivo cambia los límites de un ciclo ya cerrado.
 */
export const cycleRecord = sqliteTable(
    "cycle_records",
    {
        id: text("id").primaryKey().notNull(),
        profileId: text("user_id")
            .notNull()
            .references(() => profile.id, { onDelete: "cascade" }),
        startDate: text("start_date").notNull(),
        endDate: text("end_date").notNull(),
        cycleLength: integer("cycle_length").notNull(),
        periodLength: integer("period_length"),
        ovulationDate: text("ovulation_date"),
        ovulationBasis: text("ovulation_basis", { enum: ovulationBasisValues }),
        lutealLength: integer("luteal_length"),
        predictedStart: text("predicted_start"),
        predictionErrorDays: integer("prediction_error_days"),
        isValid: integer("is_valid", { mode: "boolean" }).notNull().default(true),
        excludedReason: text("excluded_reason"),
        createdAt: text("created_at").notNull(),
        updatedAt: text("updated_at").notNull(),
        version: integer("version").notNull().default(1),
    },
    (table) => [
        unique("uq_cycle_records_user_start_date").on(table.profileId, table.startDate),
        check("cycle_record_start_date_format_check", sql`${table.startDate} LIKE '____-__-__'`),
        check("cycle_record_end_date_format_check", sql`${table.endDate} LIKE '____-__-__'`),
        check("cycle_record_date_range_check", sql`${table.endDate} >= ${table.startDate}`),
        check("cycle_record_cycle_length_check", sql`${table.cycleLength} > 0`),
        check(
            "cycle_record_ovulation_basis_check",
            sql`${table.ovulationBasis} IS NULL OR ${table.ovulationBasis} IN ('bbt', 'opk', 'mucus', 'calendar')`,
        ),
        check(
            "cycle_record_period_length_check",
            sql`${table.periodLength} IS NULL OR ${table.periodLength} BETWEEN 1 AND 60`,
        ),
        check(
            "cycle_record_ovulation_date_format_check",
            sql`${table.ovulationDate} IS NULL OR ${table.ovulationDate} LIKE '____-__-__'`,
        ),
        check(
            "cycle_record_ovulation_date_range_check",
            sql`${table.ovulationDate} IS NULL OR ${table.ovulationDate} BETWEEN ${table.startDate} AND ${table.endDate}`,
        ),
        check(
            "cycle_record_luteal_length_check",
            sql`${table.lutealLength} IS NULL OR ${table.lutealLength} BETWEEN 1 AND 40`,
        ),
        check(
            "cycle_record_predicted_start_format_check",
            sql`${table.predictedStart} IS NULL OR ${table.predictedStart} LIKE '____-__-__'`,
        ),
        check("cycle_record_is_valid_check", sql`${table.isValid} IN (0, 1)`),
    ],
);

export const cycleRecordRelations = relations(cycleRecord, ({ one }) => ({
    profile: one(profile, {
        fields: [cycleRecord.profileId],
        references: [profile.id],
    }),
}));

/** Tipo que representa un ciclo cerrado al leer desde la base de datos. */
export type CycleRecord = typeof cycleRecord.$inferSelect;

/** Tipo para insertar un ciclo cerrado. */
export type InsertCycleRecord = typeof cycleRecord.$inferInsert;

/** Tipo para actualizar un ciclo cerrado sin modificar identidad ni auditoría base. */
export type UpdateCycleRecord = Partial<Omit<CycleRecord, "id" | "createdAt" | "updatedAt">>;
