import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Esquema de la tabla `schema_migrations`, sello local de la versión materializada
 * del contrato SQLite.
 * - `version`: Versión numérica aplicada en la base local.
 * - `name`: Nombre legible y único del corte de esquema.
 * - `appliedAt`: Timestamp en que quedó registrada la aplicación del esquema.
 *
 * La tabla es append-only y sirve como bitácora mínima para resets hoy y
 * migraciones incrementales en el futuro.
 */
export const schemaMigration = sqliteTable("schema_migrations", {
    version: integer("version").primaryKey().notNull(),
    name: text("name").notNull().unique(),
    appliedAt: text("applied_at").notNull(),
});

/** Tipo que representa un sello de migración al leer desde la base de datos. */
export type SchemaMigration = typeof schemaMigration.$inferSelect;

/** Tipo para insertar un sello de migración. */
export type InsertSchemaMigration = typeof schemaMigration.$inferInsert;

/** Tipo para actualizar metadatos del sello sin modificar su versión primaria. */
export type UpdateSchemaMigration = Partial<Omit<SchemaMigration, "version">>;
