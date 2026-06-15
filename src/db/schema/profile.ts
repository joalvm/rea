import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const defaults = {
    remindersEnabled: true,
    reminderIntervalHours: 6,
    reminderWindowStart: "09:00",
    reminderWindowEnd: "22:00",
    version: 1,
};

/**
 * Esquema de la tabla `user_profile` que almacena la configuración del perfil del usuario,
 * incluyendo las preferencias de recordatorios y la ventana de tiempo para recibirlos.
 * - `id`: Identificador único del perfil (clave primaria).
 * - `remindersEnabled`: Indica si los recordatorios están habilitados (booleano).
 * - `reminderIntervalHours`: Intervalo en horas para los recordatorios (entre 1 y 24).
 * - `reminderWindowStart`: Hora de inicio de la ventana para recibir recordatorios (formato HH:MM).
 * - `reminderWindowEnd`: Hora de fin de la ventana para recibir recordatorios (formato HH:MM).
 * - `createdAt`: Timestamp de creación del perfil.
 * - `updatedAt`: Timestamp de la última actualización del perfil.
 * - `version`: Versión del esquema del perfil, útil para futuras migraciones.
 *
 * La tabla incluye varias restricciones para garantizar la integridad de los datos, como verificar que
 * los valores booleanos sean 0 o 1, que el intervalo de horas esté dentro de un rango válido, y que las horas de inicio
 * y fin de la ventana estén en el formato correcto y que la hora de inicio sea anterior a la hora de fin.
 */
export const profile = sqliteTable(
    "user_profile",
    {
        id: text("id").primaryKey().notNull(),
        remindersEnabled: integer("reminders_enabled", { mode: "boolean" })
            .notNull()
            .default(defaults.remindersEnabled),
        reminderIntervalHours: integer("reminder_interval_hours").notNull().default(defaults.reminderIntervalHours),
        reminderWindowStart: text("reminder_window_start").notNull().default(defaults.reminderWindowStart),
        reminderWindowEnd: text("reminder_window_end").notNull().default(defaults.reminderWindowEnd),
        createdAt: text("created_at")
            .notNull()
            .default(sql`(CURRENT_TIMESTAMP)`),
        updatedAt: text("updated_at")
            .notNull()
            .default(sql`(CURRENT_TIMESTAMP)`),
        version: integer("version").notNull().default(defaults.version),
    },
    (table) => [
        check("reminders_enabled_check", sql`${table.remindersEnabled} IN (0, 1)`),
        check("interval_hours_check", sql`${table.reminderIntervalHours} BETWEEN 1 AND 24`),
        check("window_start_format", sql`${table.reminderWindowStart} GLOB '[0-2][0-9]:[0-5][0-9]'`),
        check("window_end_format", sql`${table.reminderWindowEnd} GLOB '[0-2][0-9]:[0-5][0-9]'`),
        check("window_order_check", sql`${table.reminderWindowStart} < ${table.reminderWindowEnd}`),
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
