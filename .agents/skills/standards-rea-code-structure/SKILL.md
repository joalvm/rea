---
name: standards-rea-code-structure
description: "Use when deciding where a file belongs in Rea, creating folders or files, organizing screens, features, ui, modules, and types, or reviewing imports and file ownership. Triggers: estructura, carpetas, archivos, ui plano, no barrels, modules por carpeta, imports directos, types por ambito."
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
- Tipos e interfaces no deben quedar dentro de paginas grandes.
- Tipos compartidos van a `src/types/`.
- Tipos locales van junto a su dueño en `*.types.ts`.
- `modules/` no importa de `screens/`, `features/` ni `ui/`.
- No usar nombres comodin como `helpers.ts`, `utils.ts`, `common.ts` o `misc.ts` sin apellido de responsabilidad.

## Capas

### `app/`

- Shell global, bootstrap, listeners, controladores de escenas y modales.

### `screens/`

- Entry point de cada pantalla.
- Componentes, hooks, utils y tipos exclusivos de esa pantalla.

### `features/`

- UI y logica de dominio reutilizable entre pantallas.

### `ui/`

- Componentes visuales compartidos y neutrales al dominio.
- Debe quedar plano.

### `modules/`

- Logica de negocio, datos, calculos, notificaciones, almacenamiento.
- Repositorios, servicios y helpers puros.

### `types/`

- Tipos compartidos entre varios ambitos.
- Separar por agregado de dominio.

## Regla de ubicacion

- Si algo renderiza UI generica compartida, va a `ui/`.
- Si algo renderiza UI de negocio reusable, va a `features/`.
- Si algo solo sirve a una pantalla, vive dentro de esa pantalla.
- Si algo no toca React, evaluar `modules/` o `utils/` del ambito.
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
- tipos grandes dentro de `TodayScreen.tsx` o `CheckInModal.tsx`.
- helpers de dominio dentro de componente visual.
- modulo plano gigante con veinte archivos sin carpetas de contexto.

## Checklist rapido

- archivo tiene dueño claro
- capa coincide con responsabilidad
- no hay barrel
- imports son directos
- tipos estan donde corresponde
