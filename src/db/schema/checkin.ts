import { relations, sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { profile } from "./profile";

const periodStatusSignalValues = ["started", "ended", "ongoing"] as const;

/**
 * Esquema de la tabla `checkins`, registro diario o puntual de síntomas,
 * sangrado, energía, dolor y notas.
 * - `id`: Identificador único del check-in.
 * - `profileId`: Perfil propietario. En SQLite conserva la columna legacy `user_id`.
 * - `recordedAt`: Timestamp en que se registró el check-in.
 * - `localDate`: Fecha local usada para calendario y resumen diario.
 * - `cervicalMucus`: Señal autoobservable opcional de fertilidad, de 0 a 4.
 * - Campos métricos: Escalas acotadas para sangrado, dolor, energía, estrés y PMS.
 * - `periodStatusSignal`: Señal explícita sobre inicio, fin o continuidad del periodo.
 * - `note`: Nota libre opcional.
 * - `createdAt`, `updatedAt`, `deletedAt`: Auditoría local y borrado lógico.
 * - `version`: Versión optimista del registro.
 *
 * La tabla mantiene índices por fecha local y cronología de registro, y valida los
 * rangos de cada escala para que las agregaciones posteriores reciban datos sanos.
 */
export const checkin = sqliteTable(
    "checkins",
    {
        id: text("id").primaryKey().notNull(),
        profileId: text("user_id")
            .notNull()
            .references(() => profile.id, { onDelete: "cascade" }),
        recordedAt: text("recorded_at").notNull(),
        localDate: text("local_date").notNull(),
        bleedingIntensity: integer("bleeding_intensity"),
        clots: integer("clots"),
        cervicalMucus: integer("cervical_mucus"),
        mood: integer("mood"),
        energy: integer("energy"),
        stressLevel: integer("stress_level"),
        breastSensitivity: integer("breast_sensitivity"),
        libido: integer("libido"),
        painIntensity: integer("pain_intensity"),
        painInterference: integer("pain_interference"),
        pmsIntensity: integer("pms_intensity"),
        periodStatusSignal: text("period_status_signal", { enum: periodStatusSignalValues }),
        note: text("note"),
        createdAt: text("created_at").notNull(),
        updatedAt: text("updated_at").notNull(),
        deletedAt: text("deleted_at"),
        version: integer("version").notNull().default(1),
    },
    (table) => [
        index("ix_checkins_date_search").on(table.profileId, table.localDate, table.deletedAt),
        index("ix_checkins_chronological").on(table.profileId, sql`${table.recordedAt} DESC`, table.deletedAt),
        check("checkin_bleeding_intensity_check", sql`${table.bleedingIntensity} BETWEEN 0 AND 4`),
        check("checkin_clots_check", sql`${table.clots} BETWEEN 0 AND 3`),
        check(
            "checkin_cervical_mucus_check",
            sql`${table.cervicalMucus} IS NULL OR (${table.cervicalMucus} BETWEEN 0 AND 4)`,
        ),
        check("checkin_mood_check", sql`${table.mood} BETWEEN 1 AND 5`),
        check("checkin_energy_check", sql`${table.energy} BETWEEN 1 AND 5`),
        check("checkin_stress_level_check", sql`${table.stressLevel} BETWEEN 0 AND 5`),
        check("checkin_breast_sensitivity_check", sql`${table.breastSensitivity} BETWEEN 0 AND 5`),
        check("checkin_libido_check", sql`${table.libido} BETWEEN 0 AND 4`),
        check("checkin_pain_intensity_check", sql`${table.painIntensity} BETWEEN 0 AND 5`),
        check("checkin_pain_interference_check", sql`${table.painInterference} BETWEEN 0 AND 3`),
        check("checkin_pms_intensity_check", sql`${table.pmsIntensity} BETWEEN 0 AND 5`),
        check(
            "checkin_period_status_signal_check",
            sql`${table.periodStatusSignal} IN ('started', 'ended', 'ongoing') OR ${table.periodStatusSignal} IS NULL`,
        ),
        check("checkin_local_date_format_check", sql`${table.localDate} LIKE '____-__-__'`),
    ],
);

export const checkinRelations = relations(checkin, ({ one }) => ({
    profile: one(profile, {
        fields: [checkin.profileId],
        references: [profile.id],
    }),
}));

/** Tipo que representa un check-in completo al leer desde la base de datos. */
export type Checkin = typeof checkin.$inferSelect;

/** Tipo para insertar un check-in. */
export type InsertCheckin = typeof checkin.$inferInsert;

/** Tipo para actualizar un check-in sin modificar identidad ni auditoría base. */
export type UpdateCheckin = Partial<Omit<Checkin, "id" | "createdAt" | "updatedAt">>;
