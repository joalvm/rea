# 06 · Diario

> **Hito:** M2 · **Depende de:** 02 (check-in) · **Estado:** ✅. En la
> arquitectura de información propuesta, el diario vive como **lista cronológica dentro
> de Calendario** y como detalle de día (`diary/[date]`); este plan define la lógica sea
> cual sea el tab final.

## Contexto

Registrar sin poder corregir es una trampa: un dato mal metido un martes cualquiera
envenenaría estadísticas para siempre. El diario da a la usuaria propiedad total sobre
su historial: ver, editar, borrar y — la pieza fina — **excluir** un registro de las
estadísticas sin borrarlo (fiebre, medicación puntual, un día que no la representa).

## Decisiones base

- **Editar reusa el wizard del check-in** con el borrador precargado desde la fila
  existente; al guardar, misma transacción y mismo recálculo. Cero pantallas de edición
  paralelas.
- **Borrar es soft delete + recálculo**, con undo inmediato (snackbar); nada de diálogos
  de culpa.
- **Excluir es higiene estadística de primera clase:** `excluded_from_summary = 1`
  mantiene el registro visible en el diario (marcado "no cuenta para tus estadísticas")
  pero el proyector lo ignora. Reversible con un tap.
- **Lista cronológica** agrupada por día, con resumen compacto por entrada (hora,
  chips de lo registrado, nota truncada); el detalle de día completo es el sheet del
  calendario.
- **Las relaciones y las rachas se editan con sus dueños** (planes 08/03); el diario
  enlaza, no duplica mutaciones.

## Señal → valor

Meta-valor: confianza en los datos. Una historia corregible es una historia que la
usuaria defiende como suya — y la exclusión protege las curvas del plan 07 de los días
que no la representan.

## Fases

### [x] Fase 1: Lista + detalle

- **Objetivo:** ver todo lo registrado, ordenado y legible.
- **Cambios:** mockup (`docs/design-system/screens/diario.html`); lista cronológica con
  live query paginada por mes; entrada → detalle de día (`diary/[date]`, compartido con
  el calendario).
- **No hacer:** edición (fase 2); búsqueda.
- **Cierre:** registro nuevo aparece en la lista al instante (live query); scroll fluido
  con 6 meses de datos seed.

### [x] Fase 2: Editar y borrar

- **Objetivo:** la usuaria puede borrar cualquier registro y editar el del día actual
  reusando el wizard de check-in. Editar el pasado no está permitido (el dato histórico
  es inmutable; para corregir, borrar y re-crear).
- **Cambios:** mutación `updateCheckin` transaccional (soft-delete + re-insert de
  síntomas/medicamentos) + `getCheckinById` + ruta puente `checkin/edit/[id]` (today-guard
  + hidrata el draft en modo edición); `deleteCheckin` + `restoreCheckin` soft en las tres
  tablas (`checkins`, `checkin_symptoms`, `checkin_medications`) con snackbar global de
  deshacer; ambos recalculan el rango desde la fecha tocada.
- **No hacer:** editar la fecha del registro moviéndolo de día; editar relaciones
  (`intercourse_log`, entidad first-class sin FK al checkin); editar registros pasados.
- **Cierre:** `deleteCheckin` marca las 3 tablas y `listCheckinsOfDay` lo excluye;
  `restoreCheckin` revierte y vuelve a aparecer; `updateCheckin` preserva `recordedAt`/
  `createdAt`, reemplaza síntomas/meds y recalcula (tests de integración).

### [x] Fase 3: Exclusión estadística

- **Objetivo:** "este registro no me representa" sin perder el dato.
- **Cambios:** toggle de exclusión por registro en el detalle (`ToggleRow` + chip
  "No cuenta"); servicio `setCheckinExclusion` idempotente que recalcula desde la fecha
  del registro; `summarizeDay` ignora excluidos (coherencia con el proyector, que ya los
  filtraba).
- **No hacer:** exclusión masiva por rango (criterio de entrada: alguien la pide).
- **Cierre:** excluir un check-in baja el `checkinCount` del día en `daily_summary` y
  cambia las medias del resumen en memoria; el diario lo sigue mostrando marcado (test de
  integración).

## Riesgos y preguntas abiertas

- **Ediciones que tocan rachas** (cambiar sangrado a 0 el día de inicio): la mutación
  delega en la reconciliación del plan 03 y avisa antes de romper una racha confirmada.
- **Volumen:** años de registros piden paginación desde el día uno (por mes es
  suficiente).
