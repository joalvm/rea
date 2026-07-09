import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const defaults = {
    version: 1,
};

/**
 * Esquema de la tabla `user_profile`, perfil único local de la usuaria.
 * - `id`: Identificador único del perfil (clave primaria).
 * - `name`: Nombre mostrado localmente en la app.
 * - `birthYear`: Año de nacimiento opcional, minimizado a banda de edad.
 * - `createdAt`: Timestamp de creación del perfil.
 * - `updatedAt`: Timestamp de la última actualización del perfil.
 * - `version`: Versión del esquema del perfil, útil para futuras migraciones.
 *
 * La tabla minimiza dato sensible, guarda solo un perfil local y valida rango de año.
 */
export const profile = sqliteTable(
    "user_profile",
    {
        id: text("id").primaryKey().notNull(),
        name: text("name").notNull(),
        birthYear: integer("birth_year"),
        createdAt: text("created_at").notNull(),
        updatedAt: text("updated_at").notNull(),
        version: integer("version").notNull().default(defaults.version),
    },
    (table) => [
        check("birth_year_check", sql`${table.birthYear} IS NULL OR (${table.birthYear} BETWEEN 1900 AND 2100)`),
    ],
);

/**
 * Tipo que representa un perfil de usuario completo, incluyendo todos los campos definidos en la tabla `user_profile`.
 * Este tipo se utiliza para las operaciones de selección, donde se recuperan todos los datos del perfil del usuario.
 */
export type Profile = typeof profile.$inferSelect;

/**
 * Tipo para insertar un nuevo perfil de usuario, que incluye todos los campos necesarios para crear un registro en la tabla `user_profile`.
 * Este tipo se utiliza para las operaciones de inserción, donde se deben proporcionar todos los campos requeridos,
 * aunque algunos tienen valores predeterminados establecidos en la base de datos.
 */
export type InsertProfile = typeof profile.$inferInsert;

/**
 * Tipo para actualizar un perfil de usuario, permitiendo modificar cualquier campo excepto
 * `id`, `createdAt` y `updatedAt`, que son gestionados automáticamente por la base de datos.
 * Este tipo se utiliza para las operaciones de actualización, donde solo se necesitan los campos que se desean cambiar.
 */
export type UpdateProfile = Partial<Omit<Profile, "id" | "createdAt" | "updatedAt">>;
