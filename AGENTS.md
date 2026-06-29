# AGENTS.md

Guía de alto impacto para sesiones de OpenCode en Rea. Solo lo que un agente erraría
sin ayuda. Todo es verificable contra el código.

## Stack

Expo SDK 56 · React 19 · RN 0.85 · Expo Router (entry `expo-router/entry`, `app/` son
SOLO rutas; cada ruta importa su screen desde `src/features/<feature>/`) · Drizzle +
expo-sqlite (WAL, `enableChangeListener: true`) · Zustand + MMKV · i18next.

## Validación — orden obligatorio

Los dos primeros arreglan ruido de formato; los dos siguientes encuentran errores reales.
Ejecutar SIEMPRE en este orden antes de dar por terminado un cambio:

```
npm run format        # prettier --write .
npm run lint:fix      # expo lint --fix
npm run typecheck     # tsc --noEmit
npm run lint          # expo lint
```

Tests: `npm test` · `npm run test:unit` · `npm run test:integration` · `npm run test:db`.
CI (`.github/workflows/validate.yml`, Node 22) corre **solo typecheck + lint**, no tests.

## Alias de importación (tsconfig + jest.config)

- `@/*` → `src/*`
- `@assets/*` → `assets/*`
- `@test/*` → `test/*`
- `@test/db/*` → **`test/unit/db/*`** (override fácil de errar: NO es `test/db`)

## Base de datos

- `src/db/schema/schema.sql` es **DOCUMENTACIÓN**. El SQL real de CREATE se genera desde
  los esquemas Drizzle en `src/db/schema/*.ts` vía `src/db/utils/buildSchemaSql.ts`.
  Cambiar schema = editar Drizzle **y** mantener `schema.sql` sincronizado.
- `initializeDatabase` hace **RESET TOTAL** al cambiar `DATABASE_VERSION`
  (`src/db/config.ts`). No hay migraciones incrementales todavía: subir la versión borra
  la DB local.
- Tests NO usan expo-sqlite ni mockean SQLite: usan `@libsql/client` en `:memory:`
  (`test/utils/createRealDatabase.ts`), con foreign keys forzadas. Ver `test/README.md`.
- Lecturas → hooks con `useLiveQuery`. Escrituras → mutaciones en transacción. El store
  Zustand **nunca** cachea datos de la DB.
- Al cambiar schema, actualizar en cadena: `test/unit/db/schema/*` (columnas, checks,
  índices), seeders en `test/integration/db/seeders/`, integración en
  `test/integration/db/schema/`.

## Estructura de features (reglas duras)

Convención completa en `.agents/skills/standards-rea-code-structure`. Lo crítico:

- Raíz de feature/subfeature: **solo** `XScreen.tsx` + `XStyle.ts`. El resto va en carpeta
  por tipo (`components/`, `hooks/`, `utils/`, `types/`, `stores/`, `mutations/`,
  `services/`). Nada suelto en la raíz.
- Estilos en `*Style.ts` hermano: `export const useXStyles = createStyles((theme) => ...)`.
  Sin `createStyles` inline en screens/components (salvo componente trivial).
- Sin barrels (`index.ts` que re-exporta): rompen Fast Refresh.
- Un feature no importa de otro; lo compartido sube a `shared/` o `components/`.
- `lang/` es SOLO JSON.

## Boundaries de UI, navegación y datos (reglas duras)

- Navegación (`useRouter`, `router.push/replace/back`, `Redirect`, `Link`) vive **solo** en
  archivos de ruta `app/**` y layouts/guards. Nunca en screens de feature, hooks, stores,
  services, mutaciones ni componentes compartidos.
- Los hooks de feature exponen estado y handlers semánticos (`submit...`, `load...`,
  `toggle...`) o callbacks inyectables; no conocen rutas ni importan `expo-router`.
- Los `*Screen.tsx` de feature/subfeature exponen UI + solo los handlers primitivos de
  navegación que realmente usan (`onPush`, `onReplace`, `onBack`, etc.); nunca importan
  `expo-router` ni ejecutan navegación directamente.
- Los componentes, incluidos los screens, nunca interactúan directo con la capa de datos.
  La frontera obligatoria es `component/screen -> hook o store del feature -> service o
mutación injectable -> schema`.
- Los services/mutations del feature reciben `Database` por inyección desde el hook/store.
  No importar ni consumir singletons de DB desde features.

## Modelo de dominio

- Intención reproductiva en `reproductive_intent_history.reproductive_mode`: un único
  eje que combina tipo de seguimiento + intención. Valores: `tracking_only` |
  `tracking_avoid_pregnancy` | `tracking_ttc` | `pregnancy_tracking`. Reemplaza al
  antiguo par (`current_mode`, `cycle_intent`); ya no hay columna `cycle_intent` ni
  CHECK de consistencia. La exclusión TTC+anticonceptivos sigue enforced por CHECK.
- Para ramificar ciclo vs embarazo usar `isPregnancyMode(mode)` (`pregnancy_tracking`).
- Los modos **comparten las mismas rutas**; la UI se adapta por modo, no se multiplican
  features por modo.
- Segmentación de contenido y síntomas: `content_items.target_mode` y
  `symptom_catalog.applicable_mode` usan el mismo vocabulario + `all`
  (`reproductiveModeFilterValues`).
- Tablas internas (calculadas/sembradas, **sin pantalla de gestión** para la usuaria):
  `daily_summary`, `cycle_predictions` (read models); `content_*` (motor editorial);
  `symptom_catalog` (seed global); `medication_catalog` (crece implícitamente desde
  check-ins, se ofrece como autocompletado). Solo perfil y ajustes son editables.

## Quirks

- `tsconfig.json` tiene `noUncheckedIndexedAccess: true`: el acceso a array/record es
  `T | undefined` y debe manejarse (nada de asumir `arr[0]` definido).
- SVG se importa como componente RN vía `react-native-svg-transformer`
  (`metro.config.js`).
- Prettier: 120 cols, 4 espacios, doble comilla, trailing comma `all`, LF.
