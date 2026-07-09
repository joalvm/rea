import { relations, sql } from "drizzle-orm";
import { check, index, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { contentSurfaceValues } from "@/db/enums/content";

import { contentItem } from "./contentItem";
import { profile } from "./profile";

/**
 * Esquema de la tabla `content_delivery_log`, bitácora local de contenido mostrado.
 * - `id`: Identificador único del evento de entrega.
 * - `profileId`: Perfil receptor. En SQLite conserva la columna legacy `user_id`.
 * - `contentItemId`: Contenido mostrado.
 * - `contentVersion`: Versión editorial mostrada, para reentregar cambios futuros.
 * - `surface`: Superficie donde se mostró el contenido.
 * - `shownAt`: Timestamp de visualización.
 * - `dismissedAt`: Timestamp opcional de descarte.
 *
 * La tabla permite evitar repetición excesiva por perfil y superficie. Sus FKs
 * hacen cascada para limpiar eventos cuando se elimina el perfil o el contenido.
 */
export const contentDeliveryLog = sqliteTable(
    "content_delivery_log",
    {
        id: text("id").primaryKey().notNull(),
        profileId: text("user_id")
            .notNull()
            .references(() => profile.id, { onDelete: "cascade" }),
        contentItemId: text("content_item_id")
            .notNull()
            .references(() => contentItem.id, { onDelete: "cascade" }),
        contentVersion: text("content_version").notNull(),
        surface: text("surface", { enum: contentSurfaceValues }).notNull(),
        shownAt: text("shown_at").notNull(),
        dismissedAt: text("dismissed_at"),
    },
    (table) => [
        index("ix_content_delivery_user_recent").on(table.profileId, table.surface, sql`${table.shownAt} DESC`),
        check("content_delivery_surface_check", sql`${table.surface} IN ('today', 'day_detail', 'statistics')`),
    ],
);

export const contentDeliveryLogRelations = relations(contentDeliveryLog, ({ one }) => ({
    profile: one(profile, {
        fields: [contentDeliveryLog.profileId],
        references: [profile.id],
    }),
    contentItem: one(contentItem, {
        fields: [contentDeliveryLog.contentItemId],
        references: [contentItem.id],
    }),
}));

/** Tipo que representa un evento de entrega de contenido al leer desde la base de datos. */
export type ContentDeliveryLog = typeof contentDeliveryLog.$inferSelect;

/** Tipo para insertar un evento de entrega de contenido. */
export type InsertContentDeliveryLog = typeof contentDeliveryLog.$inferInsert;

/** Tipo para actualizar un evento de entrega sin modificar su identidad. */
export type UpdateContentDeliveryLog = Partial<Omit<ContentDeliveryLog, "id">>;
