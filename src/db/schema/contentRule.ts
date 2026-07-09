import { relations, sql } from "drizzle-orm";
import { check, index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { contentRuleTriggerTypeValues } from "@/db/enums/content";

import { contentItem } from "./contentItem";

/**
 * Esquema de la tabla `content_rules`, reglas declarativas que conectan contenido
 * con fases, síntomas, métricas o intención reproductiva.
 * - `id`: Identificador estable de la regla.
 * - `contentItemId`: Contenido al que pertenece la regla.
 * - `triggerType`: Tipo de disparador evaluado.
 * - `triggerKey`: Clave específica del disparador, si aplica.
 * - `minValue`, `maxValue`: Rango numérico para reglas de métricas.
 * - `requiredValue`: Valor requerido para reglas discretas.
 * - `priority`: Prioridad de evaluación.
 * - `createdAt`, `updatedAt`: Auditoría local del catálogo.
 *
 * La tabla mantiene reglas como datos. No ejecuta lógica de negocio, solo
 * conserva el contrato que luego podrá consumir una capa de selección.
 */
export const contentRule = sqliteTable(
    "content_rules",
    {
        id: text("id").primaryKey().notNull(),
        contentItemId: text("content_item_id")
            .notNull()
            .references(() => contentItem.id, { onDelete: "cascade" }),
        triggerType: text("trigger_type", { enum: contentRuleTriggerTypeValues }).notNull(),
        triggerKey: text("trigger_key"),
        minValue: real("min_value"),
        maxValue: real("max_value"),
        requiredValue: text("required_value"),
        priority: integer("priority").notNull().default(100),
        createdAt: text("created_at").notNull(),
        updatedAt: text("updated_at").notNull(),
    },
    (table) => [
        index("ix_content_rules_lookup").on(table.triggerType, table.triggerKey, table.priority),
        check(
            "content_rule_trigger_type_check",
            sql`${table.triggerType} IN ('phase', 'symptom', 'metric_threshold', 'reproductive_intent', 'contraception', 'pregnancy_week', 'general')`,
        ),
    ],
);

export const contentRuleRelations = relations(contentRule, ({ one }) => ({
    contentItem: one(contentItem, {
        fields: [contentRule.contentItemId],
        references: [contentItem.id],
    }),
}));

/** Tipo que representa una regla de contenido al leer desde la base de datos. */
export type ContentRule = typeof contentRule.$inferSelect;

/** Tipo para insertar una regla de contenido. */
export type InsertContentRule = typeof contentRule.$inferInsert;

/** Tipo para actualizar una regla de contenido sin modificar identidad ni auditoría base. */
export type UpdateContentRule = Partial<Omit<ContentRule, "id" | "createdAt" | "updatedAt">>;
