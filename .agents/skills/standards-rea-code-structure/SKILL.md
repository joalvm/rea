---
name: standards-rea-code-structure
description: "Use when deciding where a file belongs in Rea, creating folders or files, organizing screens, features, ui, modules, and types, or reviewing imports and file ownership. Triggers: estructura, carpetas, archivos, ui plano, no barrels, modules por carpeta, imports directos, types por ambito, props junto al componente, no props en .types."
---

# Rea File Structure

## Objetivo

Definir donde vive cada archivo en Rea. Esta skill no habla de migraciones. Solo fija estructura, capas y reglas de ubicacion.

## Mantra

Orden y claridad. Cada archivo debe tener dueño claro.

## Reglas duras

- No barrels nunca.
- No `index.ts` para re-exportar.
- `ui/` es plano. Solo archivos.
- `modules/` se separa por carpetas de contexto: `cycle/`, `storage/`, `notifications/`.
- Dentro de cada modulo solo crear subcarpetas si hay 2 o mas archivos del mismo tipo o un subdominio claro.
- Tipos compartidos van a `src/types/`.
- Props de componentes React viven en mismo archivo que su dueño.
- Orden obligatorio en componentes React: definicion de `Props` primero, componente despues.
- No crear `*.types.ts` para guardar solo props de un componente.
- Tipos locales no-props compartidos por varios archivos del mismo ambito pueden vivir en `*.types.ts`.
- Si un archivo de tipos local queda con solo `FooProps`, ese tipo debe volver al archivo del componente.
- `modules/` no importa de `screens/`, `features/` ni `ui/`.
- No usar nombres comodin como `helpers.ts`, `utils.ts`, `common.ts` o `misc.ts` sin apellido de responsabilidad.

## Capas

### `app/`

- Shell global, bootstrap, listeners, controladores de escenas y modales.
- Componentes propios de shell como escenas o wrappers viven aqui, no en `screens/`.
- Tipos locales de shell solo salen a `app-shell.types.ts` si los comparten 2 o mas archivos del ambito y no son props de componente.

### `screens/`

- Entry point de cada pantalla.
- Componentes, hooks, utils y tipos exclusivos de esa pantalla.
- Props de screen y de sus subcomponentes quedan en cada archivo `.tsx`, no en `*.types.ts`.

### `features/`

- UI y logica de dominio reutilizable entre pantallas.
- Props de modales, filas, cards y bloques visuales de feature quedan en archivo duenio.

### `ui/`

- Componentes visuales compartidos y neutrales al dominio.
- Debe quedar plano.
- Cada componente define sus props en mismo archivo.

### `modules/`

- Logica de negocio, datos, calculos, notificaciones, almacenamiento.
- Repositorios, servicios y helpers puros.
- Si modulo exporta componentes React puntuales, sus props siguen misma regla: inline en archivo duenio.

### `types/`

- Tipos compartidos entre varios ambitos.
- Separar por agregado de dominio.

## Regla de ubicacion

- Si algo renderiza UI generica compartida, va a `ui/`.
- Si algo renderiza UI de negocio reusable, va a `features/`.
- Si algo solo sirve a una pantalla, vive dentro de esa pantalla.
- Si algo no toca React, evaluar `modules/` o `utils/` del ambito.
- Si tipo solo describe props de un componente, no merece `*.types.ts`; vive junto al componente.
- Si tipo local lo usan varios archivos del mismo ambito y no es props, evaluar `*.types.ts` del ambito.
- Si archivo mezcla demasiadas responsabilidades, dividir por dueño real.

## Estructura base

```text
src/
  app/
  ui/
  features/
  screens/
  modules/
  types/
  theme.ts
```

## Antipatrones

- `src/ui/Button/Button.tsx` para un unico archivo.
- `calendar.types.ts` o `settings.types.ts` usados solo para `FooProps`.
- `OnboardingScreen.tsx` o `CheckInModal.tsx` importando props de un `*.types.ts` hermano.
- tipos grandes de dominio compartido metidos dentro de un `.tsx`.
- helpers de dominio dentro de componente visual.
- modulo plano gigante con veinte archivos sin carpetas de contexto.

## Checklist rapido

- archivo tiene dueño claro
- capa coincide con responsabilidad
- no hay barrel
- imports son directos
- props React viven en mismo archivo que componente
- `*.types.ts` solo guarda tipos compartidos reales, no props aisladas
