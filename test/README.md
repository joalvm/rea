# Testing

Estado actual: testing enfocado solo en capa datos.

## Stack

- Runner: Jest con `jest-expo`.
- DB real en Node: `@libsql/client` con SQLite en memoria.
- Query layer real: Drizzle sobre `drizzle-orm/libsql`.
- DB lifecycle y cambios de schema: Jest bajo `test/db-migrations/`.

## Estructura

```text
test/
  README.md
  unit/
    db/
      schema/
      utils/
    theme/
  integration/
    db/
      schema/
      seeders/
      utils/
  db-migrations/
  utils/
    createRealDatabase.ts
```

## Qué va en cada categoría

### `test/unit/`

Pruebas puras y aisladas.

- Helpers, funciones deterministas y lógica sin runtime nativo.
- Contratos puros del sistema de tema.
- Metadatos de schema Drizzle que pueden validarse en Node.
  Ejemplo actual:

- `test/unit/db/schema/`: asegura columnas, índices, checks y claves del schema.
- `test/unit/db/utils/uuid.test.ts`: valida el contrato del UUIDv7.
- `test/unit/theme/theme.test.ts`: protege referencias estables, adaptación a navegación y contrato de paletas por fase.

### `test/integration/`

Pruebas con SQLite real y consultas reales.

- Creación real de tablas en SQLite embebido.
- Inserts y selects reales sobre mismas tablas del app schema.
- Validación real de foreign keys y checks.
- Suites separadas por esquema bajo `test/integration/db/schema/`.
- Seeders reutilizables y explícitos bajo `test/integration/db/seeders/`.

Regla importante:

- Aquí no se mockea SQLite.
- Aquí no se usa `expo-sqlite` desde Node.
- Aquí sí se ejecuta SQL real sobre engine SQLite embebido.
- Si test quiere probar integridad o queries reales, debe vivir aquí, no en `unit/`.

### `test/db-migrations/`

Pruebas del contrato de inicialización, versionado y reset de la base de datos.

- `initializeDatabase()`
- `resetDatabase()`
- cambios de `PRAGMA user_version`
- orden y seguridad del reset total

En esta categoría se validan contratos de lifecycle, no consultas reales con `expo-sqlite` en Node.

## Comandos

- `npm test`: corre toda la suite Jest.
- `npm run test:unit`: corre unit.
- `npm run test:integration`: corre integration.
- `npm run test:db`: corre lifecycle y cambios de schema.

## Criterios del repo

- No mezclar tests de vista mientras UI real no exista.
- No intentamos abrir `expo-sqlite` real desde Jest en Node. Ese runtime no es lugar correcto para consultas reales.
- Consultas reales hoy = SQLite embebido en memoria con mismo schema SQL generado por Drizzle.
- Cuando cambie schema, decidir si cambio afecta:
    - metadata pura `test/unit/db/schema/`
    - constraints/queries reales `test/integration/db/`
    - lifecycle/versionado `test/db-migrations/`
