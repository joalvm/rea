# 03 · Gestión de periodo (rachas)

> **Hito:** M1 · **Depende de:** 01 (motor) · **Estado:** ✅ Completo. Fase 1
> (`src/domain/period/`, reconciliación pura), Fase 2 (mutaciones `startPeriodRun` /
> `closePeriodRun` / `mergePeriodRuns` + pantalla `period/confirm`, mockup
> `docs/design-system/screens/period.html` aprobado) y Fase 3 (`updatePeriodRun` /
> `deletePeriodRun` + editor `period/edit` → `period/edit/[id]`) implementadas con
> cobertura de test (dominio + integración).

## Contexto

`period_runs` es la tabla de la que nace todo ciclo: si las rachas están mal, el motor
predice mal. La regla empieza y termina en el mundo real, no en la app — el trabajo aquí
es capturar eso con el mínimo de fricción y el máximo de honestidad: nunca inventar
inicios ni cierres, y hacer trivial corregir el pasado.

## Decisiones base

- **Tres formas de abrir una racha, todas explícitas:**
    1. Señal "me bajó" en el check-in (plan 02).
    2. CTA directo "empezó mi regla" en Hoy y en el detalle de día del calendario.
    3. **Inferencia con confirmación:** sangrado ≥ 2 registrado sin racha abierta →
       banner "¿empezó tu regla el {fecha}?" — una racha inferida jamás se crea en
       silencio; `source` registra la procedencia (`user_confirmed` / `bleeding_inferred`).
- **El cierre es del último sangrado real:** al cerrar, `end_date` = último día con
  sangrado ≥ 2 (el spotting de cola no alarga la regla). Cierre por señal "terminó" o
  por prompt de inactividad: `declared_period_length + 3` días sin sangrado → "¿terminó
  tu regla?". **Nunca autocierre silencioso.**
- **Fusión con criterio:** nuevo inicio < 3 días después de un cierre → proponer unir
  ("¿fue la misma regla?"); un día de pausa dentro de la regla es común.
- **El pasado se corrige sin castigo:** editar fechas, borrar una racha, marcar
  `excluded` (racha anómala que no debe contar para el motor ni las estadísticas). Toda
  edición dispara recálculo del rango afectado.
- **Solapes imposibles:** las mutaciones validan contra rachas vecinas; el índice
  `uq_period_runs_single_open` garantiza una sola abierta.

## Señal → valor

| Señal                | Qué produce                                                          |
| -------------------- | -------------------------------------------------------------------- |
| Inicio/fin de racha  | `cycle_records` → mediana → predicción (plan 01)                     |
| `source` de la racha | `menstruation_basis` honesto en calendario ("confirmado"/"inferido") |
| Duración de sangrado | `predicted_period_length`; estadística de duración (plan 07)         |
| Exclusión de racha   | Higiene del motor: ciclos anómalos no contaminan la ventana          |

## Fases

### [x] Fase 1: Dominio de reconciliación

- **Objetivo:** decidir qué proponer, como funciones puras.
- **Cambios:** `src/domain/period/` — `reconcilePeriodState(hechos, hoy)` devuelve la
  acción sugerida (`proponer_inicio`, `proponer_cierre`, `proponer_fusión`, nada) con su
  evidencia; reglas de validación de solapes y fusión.
- **No hacer:** UI; escrituras.
- **Cierre:** tests unit de cada regla (inferencia, inactividad, fusión, spotting de
  cola) con fixtures.

### [x] Fase 2: Mutaciones + confirmación

- **Objetivo:** abrir, cerrar y confirmar rachas desde la app.
- **Cambios:** mutaciones `startPeriodRun` / `closePeriodRun` / `mergePeriodRuns` en
  transacción con recálculo; pantalla `period/confirm` (mockup primero:
  `docs/design-system/screens/period.html`) para las propuestas del dominio; el check-in
  y Hoy invocan estas mutaciones.
- **No hacer:** edición histórica (fase 3).
- **Cierre:** test de integración — señal "me bajó" abre racha; sangrado inferido genera
  propuesta y confirmarla abre racha con `source='bleeding_inferred'`; prompt de
  inactividad cierra con `end_date` del último sangrado real.

### [x] Fase 3: Editor de historial

- **Objetivo:** corregir el pasado sin miedo.
- **Cambios:** pantalla `period/edit` — lista de rachas, editar fechas con validación de
  solapes, borrar (soft), marcar/desmarcar `excluded` con explicación de su efecto;
  recálculo tras cada cambio.
- **No hacer:** edición masiva; importación.
- **Cierre:** editar una racha antigua actualiza `cycle_records` y la predicción (test);
  QA del flujo completo.

## Riesgos y preguntas abiertas

- **Spotting premenstrual** puede disparar inferencias prematuras → el umbral es
  sangrado ≥ 2 (spotting = 1 nunca infiere); si molesta en la práctica, subir a dos días
  consecutivos ≥ 2.
- **Usuaria que ignora los prompts:** las propuestas caducan (no se acumulan como deuda
  visual); el dato sigue registrado como sangrado suelto y el diario permite crear la
  racha después.
- **Primer uso sin historia:** la racha del onboarding ("¿cuándo fue tu última regla?")
  nace como `user_confirmed` con solo `start_date`; el motor la trata como ancla débil.
