import { relations, sql } from "drizzle-orm";
import { check, index, integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { profile } from "./profile";
import { symptomCatalog } from "./symptomCatalog";

const menstruationBasisValues = ["none", "confirmed_period", "inferred_bleeding"] as const;
const estimatedPhaseValues = [
    "unknown",
    "menstrual",
    "follicular",
    "fertile_window",
    "estimated_ovulation",
    "luteal",
] as const;
const phaseSourceValues = ["observed", "estimated", "unknown"] as const;
const phaseConfidenceValues = ["low", "medium", "high"] as const;

/**
 * Esquema de la tabla `daily_summary`, modelo de lectura diario calculado por perfil.
 * - `localDate`: Fecha local resumida.
 * - `profileId`: Perfil propietario. En SQLite conserva la columna legacy `user_id`.
 * - Indicadores diarios: Menstruación, spotting, medicación y relaciones sexuales.
 * - Promedios: Estado de ánimo, energía y estrés.
 * - Máximos: Dolor y máxima intensidad de síntomas.
 * - `topSymptomKey`: Síntoma principal del día, si existe.
 * - Fase estimada: Fase, fuente y confianza del cálculo.
 * - `updatedAt`: Timestamp de última reconstrucción del resumen.
 *
 * La tabla usa clave primaria compuesta por perfil y fecha local. Sus checks
 * mantienen dominios cerrados para fases, confianza, base menstrual y booleanos.
 */
export const dailySummary = sqliteTable(
    "daily_summary",
    {
        localDate: text("local_date").notNull(),
        profileId: text("user_id")
            .notNull()
            .references(() => profile.id, { onDelete: "cascade" }),
        isMenstruationDay: integer("is_menstruation_day", { mode: "boolean" }).notNull().default(false),
        menstruationBasis: text("menstruation_basis", { enum: menstruationBasisValues }).notNull().default("none"),
        isSpottingDay: integer("is_spotting_day", { mode: "boolean" }).notNull().default(false),
        hadMedication: integer("had_medication", { mode: "boolean" }).notNull().default(false),
        hadIntercourse: integer("had_intercourse", { mode: "boolean" }).notNull().default(false),
        avgMood: real("avg_mood"),
        avgEnergy: real("avg_energy"),
        avgStress: real("avg_stress"),
        maxPain: integer("max_pain"),
        maxSymptomIntensity: integer("max_symptom_intensity").notNull().default(0),
        topSymptomKey: text("top_symptom_key").references(() => symptomCatalog.symptomKey),
        medicationReliefScore: real("medication_relief_score"),
        estimatedPhase: text("estimated_phase", { enum: estimatedPhaseValues }).notNull().default("unknown"),
        phaseSource: text("phase_source", { enum: phaseSourceValues }).notNull().default("unknown"),
        phaseConfidence: text("phase_confidence", { enum: phaseConfidenceValues }).notNull().default("low"),
        updatedAt: text("updated_at").notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.profileId, table.localDate] }),
        index("ix_daily_summary_phase").on(
            table.profileId,
            table.estimatedPhase,
            table.phaseConfidence,
            table.localDate,
        ),
        check("daily_summary_menstruation_day_check", sql`${table.isMenstruationDay} IN (0, 1)`),
        check(
            "daily_summary_menstruation_basis_check",
            sql`${table.menstruationBasis} IN ('none', 'confirmed_period', 'inferred_bleeding')`,
        ),
        check("daily_summary_spotting_day_check", sql`${table.isSpottingDay} IN (0, 1)`),
        check("daily_summary_had_medication_check", sql`${table.hadMedication} IN (0, 1)`),
        check("daily_summary_had_intercourse_check", sql`${table.hadIntercourse} IN (0, 1)`),
        check("daily_summary_max_pain_check", sql`${table.maxPain} BETWEEN 0 AND 5 OR ${table.maxPain} IS NULL`),
        check("daily_summary_symptom_intensity_check", sql`${table.maxSymptomIntensity} BETWEEN 0 AND 5`),
        check(
            "daily_summary_estimated_phase_check",
            sql`${table.estimatedPhase} IN ('unknown', 'menstrual', 'follicular', 'fertile_window', 'estimated_ovulation', 'luteal')`,
        ),
        check("daily_summary_phase_source_check", sql`${table.phaseSource} IN ('observed', 'estimated', 'unknown')`),
        check("daily_summary_phase_confidence_check", sql`${table.phaseConfidence} IN ('low', 'medium', 'high')`),
        check("daily_summary_local_date_format_check", sql`${table.localDate} LIKE '____-__-__'`),
    ],
);

export const dailySummaryRelations = relations(dailySummary, ({ one }) => ({
    profile: one(profile, {
        fields: [dailySummary.profileId],
        references: [profile.id],
    }),
    topSymptom: one(symptomCatalog, {
        fields: [dailySummary.topSymptomKey],
        references: [symptomCatalog.symptomKey],
    }),
}));

/** Tipo que representa el resumen diario calculado al leer desde la base de datos. */
export type DailySummary = typeof dailySummary.$inferSelect;

/** Tipo para insertar o reconstruir un resumen diario. */
export type InsertDailySummary = typeof dailySummary.$inferInsert;

/** Tipo para actualizar un resumen diario sin modificar su clave compuesta ni `updatedAt`. */
export type UpdateDailySummary = Partial<Omit<DailySummary, "profileId" | "localDate" | "updatedAt">>;
