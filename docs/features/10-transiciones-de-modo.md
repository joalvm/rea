# 10 · Transiciones de modo reproductivo

> **Hito:** fase 1 (puente a embarazo) en **M3**; matriz completa en M5 · **Depende
> de:** 01 (motor), 09 (episodios) · **Estado:** 🔲 no existe; el modo solo se fija en
> onboarding.

## Contexto

La vida cambia: quien evitaba ahora busca; quien buscaba está embarazada; quien estaba
embarazada ya no lo está. `reproductive_intent_history` modela esto con filas de
vigencia — la transición es **cerrar una fila y abrir otra**, nunca editar. El principio
rector: **los datos jamás se pierden al cambiar de intención**; se re-contextualizan.

La transición más urgente es ciclo → embarazo: el check-in captura test positivo en
todos los modos (plan 02, auditoría A6) y ese puente necesita existir desde M3, no
cuando llegue el resto de la matriz.

## Decisiones base

- **Una transición = una transacción:** cerrar fila de intención (`effective_to`), abrir
  la nueva, crear/cerrar episodios según destino, recalcular motor, reprogramar
  notificaciones. Todo o nada.
- **Consecuencias antes de confirmar:** cada transición muestra qué cambia ("tus
  predicciones de regla se pausan; tu historial no se toca") en una pantalla, antes del
  commit. Sin sorpresas.
- **Matriz:**

    | De → A              | Regla                                                                                                                      |
    | ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
    | ciclo ↔ ciclo       | Cambio directo (only/avoid/ttc); pide método anticonceptivo si el destino lo necesita; motor re-evalúa                     |
    | ciclo → embarazo    | Pide FUM/FPP (prellena con datos del ciclo si existen); abre episodio; pausa predicciones de ciclo                         |
    | embarazo → ciclo    | Solo con episodio **cerrado** (plan 09); entra en posparto: sin predicciones hasta la primera regla; pregunta de lactancia |
    | embarazo → embarazo | No existe (índice único de episodio abierto)                                                                               |

- **Puente de test positivo (fase 1):** la tarjeta del check-in (plan 02) lleva a la
  transición ciclo → embarazo con copy neutro; disponible en `tracking_only`, `avoid` y
  `ttc`. Rechazarla no deja rastro molesto (se puede volver desde Ajustes → Modo).
- **Colisión del mismo día** (cambiar dos veces): la segunda transición reemplaza la
  fila abierta ese día en vez de crear una vigencia de cero días.
- **El modo vive en Ajustes → Modo** ("Cambiar modo") con la matriz como opciones
  válidas; nada de cambiar modo por gesto accidental.

## Señal → valor

El historial de intenciones es en sí una señal: permite interpretar cada tramo de datos
en su contexto ("estos ciclos fueron con píldora; estos buscando") — sin él, las
estadísticas mezclarían peras con manzanas.

## Fases

### [ ] Fase 1 (M3): Puente ciclo → embarazo

- **Objetivo:** el positivo tiene salida digna desde cualquier modo de ciclo.
- **Cambios:** mutación transaccional `transitionToPregnancy` (cerrar intención, abrir
  episodio con FUM/FPP + `dating_basis`, recálculo); pantalla de consecuencias +
  captura de fecha (mockup primero); entrada desde la tarjeta del plan 02 y desde
  Ajustes → Modo.
- **No hacer:** el resto de la matriz; deshacer transiciones (se corrige con otra
  transición).
- **Cierre:** test de integración — test positivo en modo evitar → transición completa
  deja intención cerrada, episodio abierto, predicciones pausadas; QA del copy neutro.

### [ ] Fase 2 (M5): Matriz completa

- **Objetivo:** todos los caminos válidos.
- **Cambios:** transiciones ciclo ↔ ciclo (con re-pregunta de método) y
  embarazo → ciclo/posparto (lactancia, sin predicciones hasta re-ancla); pantalla
  Ajustes → Modo completa; reprogramación de notificaciones por destino (plan 12).
- **No hacer:** transiciones retroactivas con fecha pasada (criterio de entrada:
  necesidad real; hoy `effective_from` = hoy).
- **Cierre:** test por celda de la matriz; colisión del mismo día no crea vigencias de
  cero días; QA de consecuencias mostradas vs reales.

### [ ] Fase 3 (M5): Robustez

- **Objetivo:** las transiciones y el motor no se pisan.
- **Cambios:** invariantes verificadas en tests (una intención abierta, un episodio
  abierto, sin huecos de vigencia); documentación de la matriz en el código.
- **No hacer:** más estados que los cuatro modos.
- **Cierre:** suite de integración de secuencias largas (only → ttc → embarazo →
  posparto → avoid) deja historial impecable.

## Riesgos y preguntas abiertas

- **Posparto ≠ modo:** es un estado derivado (episodio cerrado + sin regla desde
  entonces) — resistir la tentación de un quinto modo; el motor ya lo contempla
  (plan 01).
- **Cambios frecuentes de método** en ciclo ↔ ciclo generan muchas filas: correcto —
  el historial explica los cambios de patrón; no compactar.
