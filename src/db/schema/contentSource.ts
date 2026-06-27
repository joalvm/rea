import { sql } from "drizzle-orm";
import { check, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { contentSourceTypeValues } from "@/db/enums/content";

/**
 * Esquema de la tabla `content_sources`, catálogo de fuentes para contenido educativo.
 * - `id`: Identificador estable de la fuente.
 * - `labelKey`: Clave i18n para el nombre visible de la fuente.
 * - `referenceKey`: Clave i18n opcional para referencia o cita breve.
 * - `sourceUrl`: URL opcional de respaldo.
 * - `sourceType`: Tipo de fuente.
 * - `reviewedAt`: Fecha o timestamp de revisión del contenido fuente.
 * - `createdAt`, `updatedAt`: Auditoría local del catálogo.
 *
 * La tabla guarda claves y metadatos, no copy visible. El tipo de fuente queda
 * cerrado para filtrar calidad de contenido.
 */
export const contentSource = sqliteTable(
    "content_sources",
    {
        id: text("id").primaryKey().notNull(),
        labelKey: text("label_key").notNull(),
        referenceKey: text("reference_key"),
        sourceUrl: text("source_url"),
        sourceType: text("source_type", { enum: contentSourceTypeValues }).notNull(),
        reviewedAt: text("reviewed_at"),
        createdAt: text("created_at").notNull(),
        updatedAt: text("updated_at").notNull(),
    },
    (table) => [
        check(
            "content_source_type_check",
            sql`${table.sourceType} IN ('medical_guideline', 'government_health', 'peer_reviewed', 'clinical_education', 'book', 'other')`,
        ),
    ],
);

/** Tipo que representa una fuente de contenido al leer desde la base de datos. */
export type ContentSource = typeof contentSource.$inferSelect;

/** Tipo para insertar una fuente de contenido. */
export type InsertContentSource = typeof contentSource.$inferInsert;

/** Tipo para actualizar una fuente sin modificar identidad ni auditoría base. */
export type UpdateContentSource = Partial<Omit<ContentSource, "id" | "createdAt" | "updatedAt">>;
