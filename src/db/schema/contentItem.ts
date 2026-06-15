import { relations, sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { contentSource } from "./contentSource";

const contentTypeValues = ["tip", "trivia", "recommendation", "educational", "alert"] as const;
const confidenceValues = ["low", "medium", "high"] as const;

/**
 * Esquema de la tabla `content_items`, catálogo local de piezas educativas,
 * recomendaciones, tips y alertas.
 * - `id`: Identificador estable del contenido.
 * - `contentType`: Tipo funcional de contenido.
 * - `topic`: Tema interno usado para reglas y agrupación.
 * - `titleKey`, `bodyKey`: Claves i18n del texto visible.
 * - `minConfidence`: Confianza mínima requerida para mostrar el contenido, si aplica.
 * - `priority`: Prioridad de selección y orden.
 * - `locale`: Locale del recurso.
 * - `sourceId`: Fuente asociada, si existe.
 * - `contentVersion`: Versión editorial del contenido.
 * - `isActive`: Activa o retira contenido sin borrar histórico.
 * - `validFrom`, `validUntil`, `reviewedAt`: Ventana editorial y revisión.
 * - `createdAt`, `updatedAt`: Auditoría local del catálogo.
 *
 * La tabla valida dominios cerrados, actividad booleana y que la ventana de
 * vigencia no quede invertida.
 */
export const contentItem = sqliteTable(
    "content_items",
    {
        id: text("id").primaryKey().notNull(),
        contentType: text("content_type", { enum: contentTypeValues }).notNull(),
        topic: text("topic").notNull(),
        titleKey: text("title_key").notNull(),
        bodyKey: text("body_key").notNull(),
        minConfidence: text("min_confidence", { enum: confidenceValues }),
        priority: integer("priority").notNull().default(100),
        locale: text("locale").notNull().default("es"),
        sourceId: text("source_id").references(() => contentSource.id),
        contentVersion: text("content_version").notNull(),
        isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
        validFrom: text("valid_from"),
        validUntil: text("valid_until"),
        reviewedAt: text("reviewed_at"),
        createdAt: text("created_at").notNull(),
        updatedAt: text("updated_at").notNull(),
    },
    (table) => [
        index("ix_content_items_active_priority").on(table.isActive, table.locale, table.priority),
        check(
            "content_item_type_check",
            sql`${table.contentType} IN ('tip', 'trivia', 'recommendation', 'educational', 'alert')`,
        ),
        check(
            "content_item_min_confidence_check",
            sql`${table.minConfidence} IN ('low', 'medium', 'high') OR ${table.minConfidence} IS NULL`,
        ),
        check("content_item_active_check", sql`${table.isActive} IN (0, 1)`),
        check(
            "content_item_valid_range_check",
            sql`${table.validUntil} IS NULL OR ${table.validFrom} IS NULL OR ${table.validUntil} >= ${table.validFrom}`,
        ),
    ],
);

export const contentItemRelations = relations(contentItem, ({ one }) => ({
    source: one(contentSource, {
        fields: [contentItem.sourceId],
        references: [contentSource.id],
    }),
}));

/** Tipo que representa una pieza de contenido al leer desde la base de datos. */
export type ContentItem = typeof contentItem.$inferSelect;

/** Tipo para insertar una pieza de contenido. */
export type InsertContentItem = typeof contentItem.$inferInsert;

/** Tipo para actualizar una pieza de contenido sin modificar identidad ni auditoría base. */
export type UpdateContentItem = Partial<Omit<ContentItem, "id" | "createdAt" | "updatedAt">>;
