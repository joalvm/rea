---
name: standards-rea-code-style
description: "Use when writing or reviewing TypeScript/React 19 code for Expo / React Native: deciding exports, naming, typing, component patterns, hooks, state, or library usage (Drizzle/SQLite, Zustand, i18n). Hard rules and naming live in this SKILL.md; per-artifact and per-library patterns live in references/, loaded on demand. Triggers: export default, naming, props, types, tipado, satisfies, import type, componente, componentizacion, hooks, estado, store, zustand, selector, useShallow, efecto, memoizacion, pureza, inmutabilidad, drizzle, schema, entidad, query, mutacion, transaccion, sqlite, theme, estilos, variants, i18n, traduccion, localizacion, comentarios, estilo de codigo, claridad, naming, styles."
---

# Estilo de Código · TypeScript + React 19

Índice de convenciones. Las reglas duras y los nombres viven aquí; la anatomía y los patrones por artefacto y por librería viven en `references/`, agrupados por dominio (`typescript/`, `react/`, `react-native/`, `zustand/`, `drizzle/`, `i18n/`), y se cargan según la tarea. (Ubicación y nombres de archivos/carpetas: skill de estructura.)

## Mantra

El código se lee de arriba hacia abajo sin saltos, cada archivo tiene un dueño claro y el tipo describe la intención. Escribe código simple y deja que el compilador y el chequeo de tipos hagan el trabajo pesado.

## Stack y línea base (2026)

- TypeScript estricto, ESM.
- React 19 con React Compiler activado.
- El formato (comillas, espacios, comas) se delega al formatter (Prettier/Biome). Esta skill gobierna semántica, no whitespace.

## Reglas duras

### React

- No `useMemo` / `useCallback` / `React.memo` por defecto: el compilador memoiza. Manual solo ante un problema medido.
- No `useEffect` para datos derivados: derivar en render.
- No `React.FC`. Props tipadas en el argumento. No tipar el retorno de un componente.
- Componentes y hooks puros → `references/react/render-rules.md`.

### TypeScript

- No `any`: usar `unknown` y estrechar → `references/typescript/narrowing.md`.
- Sintaxis borrable: sin `enum`, `namespace` ni parameter properties; usa `as const` o uniones literales.
- No `as` salvo `as const`. No el constructor `Array()`.
- `===` siempre; `== null` / `!= null` solo para chequear null+undefined juntos.
- `import type` / `export type` para imports solo-de-tipos.
- `type` por defecto; `interface` solo para declaration merging → `references/typescript/types.md`.

### Imports y exports

- **Named exports** por defecto. `export default` solo en archivos de ruta de Expo Router y los `Screen` que esas rutas reexportan.
- No exportar helpers privados que solo sirven a su dueño.
- `require` solo para assets dinámicos; el resto, `import` tipado.

### Legibilidad

- No crear componentes inline grandes dentro de otros → `references/react/componentization.md`.
- Sin números ni strings mágicos: constantes con nombre.
- Sin strings de UI hardcodeados: van por i18n → `references/i18n/usage.md`.
- Guard clauses / early returns para reducir anidamiento.
- No comentar el **qué**; comentar el **porqué** (decisiones, workarounds, contratos).

## Orden en el archivo

1. Imports absolutos (`@/`, `@assets/`); `import type` agrupado.
2. Imports relativos (solo vecino inmediato).
3. `require` excepcional.
4. `type Props` (en componentes), arriba del componente.
5. Elemento principal del archivo.
6. Helpers locales cortos que dependen del principal.

## Nombres

- Componentes: PascalCase (`ProfileCard`). Screen: PascalCase + `Screen`.
- Hooks: `use` + camelCase (`useAuthRedirect`). Hook de store: `useXStore`.
- Utilidades: camelCase con verbo o sustantivo (`formatDate`, `clamp`).
- Booleanos: prefijo `is` / `has` / `should` (`isActive`, `hasError`).
- Handlers internos: prefijo `handle` (`handleSubmit`). Callbacks en props: prefijo `on` (`onPress`).
- Constantes de módulo: CONST_CASE solo si son globales del módulo; lo demás camelCase.
- Estilos: nombres semánticos (`container`, `title`), no posicionales (`view1`).
- Evitar: `data`, `info`, `helpers`, `common`, `misc`, `temp`, `new`.

## Referencias (según la tarea)

**Lenguaje** — `references/typescript/`
- `types.md` — `type` vs `interface`, derivar en vez de duplicar.
- `narrowing.md` — `unknown`, type guards, uniones discriminadas + exhaustividad.
- `values.md` — nulabilidad, `as const`, `readonly`, `satisfies`.
- `functions.md` — declaración vs arrow, retorno de lo exportado, overloads.

**React** — `references/react/`
- `components.md` — anatomía de componente y screen, props.
- `componentization.md` — cómo partir la UI: cuándo extraer, composición.
- `hooks.md` — hooks y read-hooks de datos; cuándo va un efecto.
- `state.md` — qué es estado y dónde vive.
- `render-rules.md` — Rules of React: pureza, inmutabilidad, efectos.

**React Native** — `references/react-native/`
- `components.md` — primitivas, listas, plataforma, accesibilidad.

**Zustand** — `references/zustand/`
- `store.md` — anatomía, persistencia (MMKV), slices.
- `selectors.md` — selección, `useShallow`, actions estables.

**Drizzle / SQLite** — `references/drizzle/`
- `entities.md` — schema = entidades: tablas, relaciones, tipos inferidos.
- `queries.md` — query builder, relacional, `sql` crudo, lectura reactiva.
- `mutations.md` — insert/update/delete, soft delete, transacciones.
- `services.md` — capa de servicio/repositorio por entidad.

**i18n / l10n** — `references/i18n/`
- `setup.md` — init i18next (instancia por defecto) + idioma del sistema, namespaces por feature, claves tipadas.
- `usage.md` — `t()` con namespace explícito, interpolación, plurales.
- `l10n.md` — formato (fechas/números/moneda) con Intl + ajustes del sistema; sin tablas por país.

## Checklist

- [ ] Named exports (default solo en rutas/screens). Sin helpers privados exportados.
- [ ] `Props` en el argumento; sin `React.FC` ni retorno `JSX.Element`.
- [ ] Sin memoización manual; estado derivado en render; efectos solo para sistemas externos.
- [ ] `unknown` sobre `any`; sin `as` salvo `as const`; sin `enum` / `namespace`.
- [ ] `===`; sin números/strings mágicos; sin texto de UI hardcodeado.
- [ ] Nombres semánticos; comentarios explican el porqué.
