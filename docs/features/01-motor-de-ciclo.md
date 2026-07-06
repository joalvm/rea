# 01 · Motor de ciclo

> **Hito:** M1 · **Depende de:** esquema v3 (`cycle_records`, bordes de ventana fértil)
> · **Estado:** ❌ no existe. Es la pieza que desbloquea todo lo demás.

## Contexto

Hoy nadie escribe `daily_summary`, `cycle_predictions` ni `cycle_records`. Sin motor no
hay fase en Hoy, ni predicción en el calendario, ni estadísticas, ni notificaciones
predictivas: toda superficie leería tablas vacías.

El motor convierte los hechos registrados (`period_runs`, `checkins`,
`pregnancy_episodes`, `reproductive_intent_history`) en tres proyecciones: el historial
de ciclos cerrados (`cycle_records`), la predicción vigente (`cycle_predictions`) y el
resumen por día (`daily_summary`). Vive en `src/domain/` — dominio puro compartido, la
única extensión a la estructura estándar (auditoría C4) — y las mutaciones de los
features lo invocan tras cada escritura relevante.

## Decisiones base

- **Determinista y puro.** `(hechos, hoy) → (proyecciones)`. Sin I/O en el núcleo; la
  persistencia la hace un orquestador delgado. Testeable con fixtures de ciclos
  conocidos.
- **Ciclo** = inicio de regla → día anterior al siguiente inicio. **Válido** = 15–90
  días y no excluido. La ventana de aprendizaje son los **últimos 6 ciclos válidos**.
- **Mediana, no media**, para longitud de ciclo y de periodo (robusta a outliers); σ de
  la ventana alimenta la confianza.
- **Prior declarado:** con menos de 2 ciclos observados, predicen las longitudes del
  onboarding. La UI lo dice ("basado en lo que declaraste").
- **Fase lútea:** 14 días por defecto; personalizada (mediana de lúteas observadas)
  cuando hay ≥3 ciclos con ovulación confirmada por BBT.
- **Jerarquía de evidencia para ovulación:** BBT confirmada (regla 3-sobre-6: tres
  temperaturas seguidas por encima del máximo de las 6 previas) > OPK positivo
  (ovulación ≈ +1 día) > moco pico > calendario (próximo inicio − lútea).
  `ovulation_basis` registra cuál ganó; la UI siempre lo muestra.
- **Ventana fértil:** ovulación −5 … +1. En modo **evitar**: −7 … +2 (marco
  conservador) y la UI de evitar nunca presenta la ventana como "segura/no segura".
  Con **método hormonal vigente**: no se predice ovulación ni ventana, con explicación
  ("tu método suprime la ovulación").
- **Confianza:** `high` = ≥3 ciclos válidos, σ ≤ 2 y ovulación con evidencia en el
  último ciclo; `medium` = ≥2 ciclos válidos y σ ≤ 4; `low` = resto. Gobierna la UI
  (día exacto solo con `high`; si no, rangos) y las notificaciones predictivas (solo
  ≥ `medium`).
- **Retraso honesto:** pasada la fecha predicha, jamás se re-predice hacia adelante.
  `daily_summary` marca "retraso, día N" con confianza degradada.
- **Cierre de ciclo escribe historia:** al confirmarse un nuevo inicio, el motor crea
  el `cycle_record` del ciclo que termina, copiando `predicted_start` (la predicción
  que estaba vigente **antes** del inicio real) y calculando `prediction_error_days`.
  Así "precisión de REA" (plan 07) tiene datos reales.
- **Embarazo activo:** el motor de ciclo se pausa; la proyección semanal es del plan 09.
- **Posparto:** modo de ciclo tras episodio cerrado y sin regla registrada → **no hay
  predicción** (no hay ancla); con `breastfeeding = 1` tampoco ventana fértil. La
  primera regla cerrada re-ancla todo.
- **Recalcular es barato y seguro:** `recalculate(db, changedRange)` idempotente,
  reproyecta solo desde el inicio del ciclo afectado hasta el horizonte de predicción.

## Señal → valor

| Señal                        | Qué produce en el motor                                            |
| ---------------------------- | ------------------------------------------------------------------ |
| Sangrado / rachas de periodo | Ciclos cerrados → mediana → predicción de próxima regla            |
| BBT (+hora de toma)          | Confirmación de ovulación → lútea personalizada → mejor predicción |
| OPK / moco cervical          | Ancla de ovulación cuando no hay BBT                               |
| Longitudes declaradas        | Prior mientras no hay historia                                     |
| Método anticonceptivo        | Supresión honesta de ventana fértil                                |
| Lactancia                    | Supresión de predicciones en posparto                              |

## Fases

### [ ] Fase 1: Dominio puro

- **Objetivo:** el algoritmo completo como funciones puras.
- **Cambios:** `src/domain/cycle/` — `deriveCycles`, `cycleStats` (mediana/σ/ventana),
  `estimateOvulation` (jerarquía de evidencia), `fertileWindow` (por modo/método),
  `confidence`, `predictNextCycle`. Fixtures documentados: regular, irregular, retraso,
  posparto (con y sin lactancia), método hormonal, BBT ruidosa.
- **No hacer:** I/O, persistencia, hooks; estadística avanzada o ML.
- **Cierre:** suite unit con los fixtures; cada regla numérica de "Decisiones base"
  tiene su test con nombre legible.

### [ ] Fase 2: Proyector de `daily_summary`

- **Objetivo:** un row por día, correcto e idempotente.
- **Cambios:** `src/domain/projection/` — `projectRange(hechos, rango)` produce filas
  completas: fase estimada, `phase_source`, confianza, `cycle_day`, `checkin_count`,
  marcadores (menstruación/spotting/fértil/ovulación), agregados diarios (medias de
  ánimo/energía/estrés, dolor máximo, síntoma top, alivio).
- **No hacer:** proyectar fuera del rango afectado; lógica de UI.
- **Cierre:** doble corrida = filas idénticas (test de idempotencia); tests de borde
  (día de cambio de modo, día de inicio inferido).

### [ ] Fase 3: Orquestador y disparadores

- **Objetivo:** los hechos disparan recálculo; las proyecciones persisten.
- **Cambios:** `src/domain/engine/` — `recalculate(db, changedRange)` en transacción:
  upsert de `cycle_predictions` (con bordes de ventana), cierre de `cycle_records`
  (predicción emitida vs inicio real), reproyección del rango. Tabla de disparadores
  documentada en el código: abrir/cerrar/editar periodo, escribir/editar/excluir
  check-in, cambiar intención, abrir/cerrar episodio de embarazo.
- **No hacer:** background tasks; recálculo total cuando basta el rango.
- **Cierre:** test de integración con SQLite real — secuencia de eventos de 4 ciclos
  produce `cycle_records` con errores de predicción correctos y `daily_summary`
  coherente; editar un periodo antiguo repara todo el rango.

### [ ] Fase 4: Read hooks

- **Objetivo:** las superficies leen el motor de forma reactiva y uniforme.
- **Cambios:** hooks base con `useLiveQuery`: `useTodaySummary`, `useDailySummary(range)`,
  `useCurrentPrediction`, `useActiveIntent`, `useCycleRecords(n)`. Los features los
  envuelven en sus `queries/` según el estándar.
- **No hacer:** hooks por pantalla aquí; caching en Zustand.
- **Cierre:** un cambio de datos se refleja en un hook montado (test con render de
  prueba); typecheck.

## Riesgos y preguntas abiertas

- **BBT ruidosa:** tomas tardías distorsionan la regla 3-sobre-6; la hora de toma
  permite descartar outliers, y un ciclo sin confirmación cae con dignidad a la
  siguiente evidencia.
- **Ciclos anovulatorios:** sin evidencia de ovulación el ciclo predice por calendario
  con confianza degradada; jamás se inventa ovulación.
- **Ediciones retroactivas grandes** (borrar un periodo de hace 4 meses): recalcular
  todo el historial es aceptable — son miles de filas como mucho; medir antes de
  optimizar.
- **Zona horaria/viajes:** `local_date` es inmutable al registrar; el motor no re-fecha
  hechos.
