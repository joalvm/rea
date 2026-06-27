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
        cycleLengthUsed: integer("cycle_length_used").notNull(),
        lutealPhaseUsed: integer("luteal_phase_used").notNull().default(14),
        confidence: text("confidence", { enum: confidenceLevelValues }).notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.profileId, table.calculationDate] }),
        check("cycle_predictions_confidence_check", sql`${table.confidence} IN ('low', 'medium', 'high')`),
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