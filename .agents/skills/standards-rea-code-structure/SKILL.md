---
name: standards-rea-code-structure
description: "Convenciones de estructura para un proyecto Expo / React Native / TypeScript con Expo Router y SQLite. Úsala al decidir dónde va un archivo o carpeta, cómo nombrarlo, al crear un feature o subfeature, organizar rutas, stores, acceso a datos, theming o i18n, y al revisar imports o límites entre capas. Aplícala siempre que aparezca: estructura, carpetas, dónde poner, feature-based, ruta, route group, _layout, screen, store, schema, migración, query, mutación, useLiveQuery, lectura/escritura, theme, tokens, i18n, lang, imports, no barrels — aunque no se pida de forma explícita."
---

# Estructura Feature-Based · Expo Router + Drizzle + Unistyles

## Mantra

Un feature es un dominio de negocio autocontenido. Las capas fluyen en una sola dirección. `app/` es solo el router. La base de datos es la fuente de verdad: se **lee con live queries**, se **escribe con mutaciones**; el store nunca la cachea.

## Stack fijo

- **Lenguaje**: TypeScript.
- **Router**: Expo Router (file-based). `app/` y `src/app/` son **solo rutas**.
- **Datos**: Drizzle + `expo-sqlite`. Schema en TS, migraciones con drizzle-kit. Conexión con `enableChangeListener: true`.
- **Estado**: Zustand para estado efímero/flujo; persistencia con MMKV.
- **Estilos**: Unistyles 3.
- **i18n**: i18next; recursos JSON en `lang/`.
- **Alias**: `@/` → `src/`, `@assets/` → `assets/`.

## Estructura

```text
src/
  app/            # Expo Router: SOLO rutas. _layout, grupos (group)
  features/       # dominios: screens, components, hooks, stores, mutaciones, types
  components/     # UI genérica theme-aware, sin dominio
  shared/         # utils/hooks/types puros, sin UI
  db/             # client.ts, schema.ts, migrations/, DatabaseProvider.tsx
  theme/          # unistyles.ts (config), light/dark, tokens
  store/          # store(s) global(es) Zustand (sesión, prefs, flags)
  modules/        # i18n/, l10n/, config/
  lang/           # SOLO JSON: <idioma>/ y <idioma-REGIÓN>/
assets/
```

## Capas

### `app/` — rutas

- **Solo rutas de Expo Router.** Nada de stores, lógica ni componentes sueltos: Expo Router intenta tratar cualquier archivo aquí como ruta.
- `app/_layout.tsx`: providers (DatabaseProvider, i18n, Unistyles) y guardas de navegación. Sustituye al antiguo `App.tsx`.
- Cada ruta importa su screen desde el feature; no contiene lógica de dominio:
  `app/(group)/thing.tsx` → `export { default } from '@/features/thing/ThingScreen'`.
- Los nombres de archivo de ruta siguen la URL; agruparlas se hace con route groups `(group)`.

### `features/`

- Cada carpeta es un dominio autocontenido: `auth/`, `profile/`, `settings/`.
- Contiene: `XScreen.tsx`, `components/`, `hooks/` (incluye read hooks de live query), `XStore.ts`, mutaciones (`createUser.ts`), `types/`.
- **No importa de otro feature.** Lo compartido sube a `shared/` o `components/`.

#### Subfeatures

- Un feature con varias rutas relacionadas se divide en subfeatures: una subcarpeta por conjunto de rutas.
- Cada subfeature replica la estructura de un feature (`XScreen.tsx`, `components/`, `hooks/`, `types/`).
- **Un solo nivel de anidamiento.** Si una subfeature pediría sub-subfeatures, es un feature propio.
- **Regla fractal**: un hermano nunca importa a otro hermano. Lo común entre subfeatures sube al `shared/` del feature (`features/<name>/shared/`), que solo se crea si es estrictamente necesario.
- El estado compartido entre subfeatures vive en el store del feature, no en una subfeature.

### `db/` — Drizzle

- `client.ts`: `openDatabaseSync(name, { enableChangeListener: true })` + `drizzle()`.
- `schema.ts`: tablas (STRICT), FKs, índices, read models. Drizzle soporta STRICT nativamente.
- `migrations/`: salida de drizzle-kit. `DatabaseProvider.tsx`: inicializa y migra al arrancar.

### Acceso a datos — regla de oro

- **Lecturas** → read hooks con `useLiveQuery`, colocados en el feature (`useUserProfile.ts`). La UI consume el hook y reacciona sola a los cambios.
- **Escrituras** → mutaciones (transacciones) en el feature; el store puede orquestarlas.
- **El store NUNCA cachea datos de la base de datos.** Guarda estado efímero/flujo y orquesta escrituras.

### `components/`

- UI genérica neutral al dominio, theme-aware: `Button`, `Card`. Cada uno en su carpeta con `*Style.ts` hermano.

### `shared/`

- utils/hooks/types puros, sin UI ni dominio.

### `theme/` — Unistyles

- `unistyles.ts`: `StyleSheet.configure` con themes **light/dark** y breakpoints.
- Tokens que dependen de un estado de dominio (acentos dinámicos) viven como **mapa de tokens** en `theme/`, **no** como themes separados.
- Estilos de componente en `*Style.ts` hermano, con el `StyleSheet.create` de Unistyles.

### `store/`

- Store(s) global(es): sesión, preferencias, flags de aplicación. Persistencia MMKV. No cachea la base de datos.

### `modules/` y `lang/`

- `modules/i18n`, `modules/l10n`, `modules/config`: toda la lógica de internacionalización y configuración.
- `lang/`: **solo JSON**. El idioma base es estándar; las variantes regionales solo contienen overrides.

## Reglas de importación

```
app/         → todo (ensambla la aplicación)
features/    → components, shared, db, theme, store, modules ; NO otro feature
subfeature   → raíz de su feature (store, shared/) + globales ; NO otra subfeature ; NO otro feature
components/  → shared, theme ; NO features, NO db
shared/      → shared ; NO features, components, db
db/          → shared
theme/       → shared
store/       → db, shared
modules/i18n → shared, modules/config
modules/l10n → shared, modules/i18n
modules/config, lang/ → nadie
```

## Nomenclatura

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Componente React | PascalCase | `Button.tsx` |
| Screen de feature | PascalCase + `Screen` | `ProfileScreen.tsx` |
| Ruta Expo Router | lowercase/kebab por URL | `reset-password.tsx`, `_layout.tsx`, `(group)/` |
| Archivo de estilos | PascalCase + `Style` | `ButtonStyle.ts` |
| Store Zustand | PascalCase + `Store` | `AuthStore.ts` |
| Hook | camelCase, prefijo `use` | `useAuth.ts` |
| Read hook (live query) | camelCase, prefijo `use` | `useUserProfile.ts` |
| Mutación DB | camelCase, verbo + entidad | `createUser.ts` |
| Tipo/Interface | PascalCase, archivo propio | `AuthPayload.ts` |
| Feature / subfeature folder | kebab-case | `user-profile/` |
| JSON lang | kebab-case | `common.json` |

## Reglas duras

- No barrels (`index.ts` que re-exporta). Rompe Fast Refresh.
- Un tipo por archivo con nombre de responsabilidad. No `*.types.ts`.
- Props en el mismo archivo del componente.
- Estilos en `*Style.ts` hermano (salvo componentes triviales).
- Sin nombres comodín (`utils.ts`, `helpers.ts`, `common.ts`): cada archivo lleva su responsabilidad (`formatDate.ts`).
- Un hermano no importa de otro hermano (features y subfeatures): lo común sube.
- No crear carpetas de capa vacías: una subfeature de un solo screen es solo `XScreen.tsx`.
- `app/` solo rutas. `lang/` solo JSON.

## Antipatrones

- Poner store, componentes o lógica en `app/` (Expo Router los trataría como rutas).
- Lógica de dominio en el archivo de ruta en vez de importar el screen del feature.
- UI o hook importando `db` directo: debe usar un read hook (`useLiveQuery`).
- Store cacheando lecturas de la base de datos: usa live query.
- Modelar un estado de dominio como theme de Unistyles: usa un mapa de tokens.
- Feature importando de otro feature, o subfeature importando de otra subfeature.
- `*.types.ts`, barrels, nombres comodín.
- Lógica en `lang/`; recursos JSON dentro de `modules/i18n`.

## Checklist

- [ ] El archivo tiene dueño claro: app (ruta) / feature / subfeature / components / shared / db / theme / store / modules.
- [ ] `app/` solo contiene rutas; providers y guardas en `_layout`.
- [ ] Lecturas vía read hook (`useLiveQuery`); escrituras vía mutación en transacción.
- [ ] El store no cachea la base de datos; solo estado efímero/flujo.
- [ ] Estilos en `*Style.ts`; theming vía Unistyles; estado de dominio = tokens, no theme.
- [ ] Sin barrels, sin `*.types.ts`, sin nombres comodín.
- [ ] Ningún hermano importa de otro hermano; lo común está en `shared/`.
- [ ] `lang/` solo JSON.
