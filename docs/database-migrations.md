# Migraciones de la base de datos

Este documento define cómo evolucionar el SQLite local sin perder datos.

## Arranque

`PRAGMA user_version` identifica la versión materializada del esquema.

- `0`: instalación nueva. Se crea el esquema actual y se registra el baseline.
- Menor que `DATABASE_VERSION`: se ejecutan migraciones consecutivas (`vN → vN+1`)
  dentro de una transacción. Cada una registra su sello en `schema_migrations`.
- Igual: solo se ejecutan seeders idempotentes.
- Mayor: se bloquea el arranque. Nunca se hace downgrade ni se borra la base.

`resetDatabase` es una operación destructiva explícita para desarrollo, pruebas y la
acción "Borrar todos los datos". No forma parte del camino normal de actualización.

## Cómo añadir una versión

Para cada cambio de `src/db/schema/`:

1. Incrementar `DATABASE_VERSION`.
2. Crear `src/db/migrations/vN-to-vN+1.ts` con una migración pequeña y explícita.
3. Registrar la migración en `src/db/migrations/registry.ts`.
4. Añadir una prueba SQLite que compruebe datos existentes, valores por defecto,
   constraints, `user_version`, `schema_migrations` y rollback ante fallo.
5. Verificar instalación nueva y actualización sobre un AVD antes de distribuir.

El generador de `buildSchemaSql` es la fuente para instalaciones nuevas; no se usa
para transformar una base existente.

## Operaciones seguras

- Columna nueva: `ALTER TABLE ... ADD COLUMN`, siempre nullable o con `DEFAULT`
  compatible con las filas existentes.
- Tabla o índice nuevo: `CREATE TABLE/INDEX IF NOT EXISTS` con la definición actual.
- Renombrar, eliminar columna o cambiar constraints/tipos: crear tabla temporal,
  copiar con un mapeo explícito, validar filas y claves, y reemplazar dentro de la
  misma transacción. Nunca hacer `DROP TABLE` directo sobre la tabla de datos.
- Datos derivados o catálogos: backfill idempotente y separado del cambio
  estructural cuando sea posible.

La versión `v6 → v7` añade `discreet_calendar` y `last_backup_at` a
`app_settings`, preservando las filas existentes.

## Backup y reinstalación

Una instalación de actualización (`adb install -r` o actualización normal firmada)
conserva el sandbox y permite ejecutar estas migraciones. `pm clear`, `adb uninstall`
y `clearState` de Maestro eliminan deliberadamente la DB local.

La clave SQLCipher se guarda en SecureStore con alcance de este dispositivo. Por
eso una desinstalación real no puede conservar datos cifrados por sí sola; para
trasladarlos se debe exportar un backup y restaurarlo. La migración de la DB local
y la migración del formato JSON de backup son problemas separados.
