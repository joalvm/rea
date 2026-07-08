import { relations, sql } from "drizzle-orm";
import { check, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { confidenceLevelValues } from "@/db/enums/confidenceLevel";

import { profile } from "./profile";

/**
 * Esquema de la tabla `cycle_predictions`, caché local de predicciones calculadas.
 * - Clave compuesta por perfil y fecha de cálculo.
 * - Guarda próxima regla, posible ovulación y supuestos usados.
 */
export const cyclePrediction = sqliteTable(
    "cycle_predictions",
    {
        profileId: text("user_id")
            .notNull()
            .references(() => profile.id, { onDelete: "cascade" }),
        calculationDate: text("calculation_date").notNull(),
        predictedNextStart: text("predicted_next_start").notNull(),
        predictedOvulation: text("predicted_ovulation"),
        predictedFertileStart: text("predicted_fertile_start"),
        predictedFertileEnd: text("predicted_fertile_end"),
        predictedPeriodLength: integer("predicted_period_length"),
        cycleLengthUsed: integer("cycle_length_used").notNull(),
        lutealPhaseUsed: integer("luteal_phase_used").notNull().default(14),
        confidence: text("confidence", { enum: confidenceLevelValues }).notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.profileId, table.calculationDate] }),
        check("cycle_predictions_confidence_check", sql`${table.confidence} IN ('low', 'medium', 'high')`),
        check(
            "cycle_predictions_fertile_start_format_check",
            sql`${table.predictedFertileStart} IS NULL OR ${table.predictedFertileStart} LIKE '____-__-__'`,
        ),
        check(
            "cycle_predictions_fertile_end_format_check",
            sql`${table.predictedFertileEnd} IS NULL OR ${table.predictedFertileEnd} LIKE '____-__-__'`,
        ),
        check(
            "cycle_predictions_fertile_window_pairing_check",
            sql`(${table.predictedFertileStart} IS NULL AND ${table.predictedFertileEnd} IS NULL)
                OR (${table.predictedFertileStart} IS NOT NULL AND ${table.predictedFertileEnd} IS NOT NULL
                    AND ${table.predictedFertileEnd} >= ${table.predictedFertileStart})`,
        ),
        check(
            "cycle_predictions_period_length_check",
            sql`${table.predictedPeriodLength} IS NULL OR ${table.predictedPeriodLength} BETWEEN 1 AND 15`,
        ),
    ],
);

export const cyclePredictionRelations = relations(cyclePrediction, ({ one }) => ({
    profile: one(profile, {
        fields: [cyclePrediction.profileId],
        references: [profile.id],
    }),
}));

/** Tipo que representa una predicción de ciclo al leer desde la base de datos. */
export type CyclePrediction = typeof cyclePrediction.$inferSelect;

/** Tipo para insertar una predicción de ciclo. */
export type InsertCyclePrediction = typeof cyclePrediction.$inferInsert;

/** Tipo para actualizar una predicción sin modificar su clave compuesta. */
export type UpdateCyclePrediction = Partial<Omit<CyclePrediction, "profileId" | "calculationDate">>;
