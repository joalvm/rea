# 05 · Calendario

> **Hito:** M3 · **Depende de:** 01 (motor), 03 (edición de periodo) · **Estado:** 🚧
> grid vivo con leyenda; falta el detalle de día como sheet.

## Contexto

El calendario es donde la predicción se ve — y donde una app deshonesta miente más:
pintar el futuro con el mismo color que el pasado hace pasar estimaciones por hechos. El
mandato aquí es visual: **lo observado y lo estimado no pueden confundirse ni por error**
(relleno sólido vs contorno/trama), y la leyenda lo enseña.

Absorbe además la vista diaria del diario: el detalle de día es un sheet sobre el mes
(arquitectura de información del [índice](README.md)).

## Decisiones base

- **Grid propio de mes** (sin librería de calendario de terceros: control total de
  marcadores, temas y accesibilidad; es una grilla de 7×6 celdas, no un problema que
  amerite dependencia).
- **Lenguaje visual:** menstruación observada = relleno sólido; predicha = contorno;
  ventana fértil estimada = trama suave; ovulación estimada = anillo; hoy = borde
  destacado; días con registro = punto discreto (`checkin_count > 0`). Embarazo: semanas
  como bandas sutiles.
- **Horizonte honesto:** predicción dibujada máximo 3 ciclos hacia delante; más allá el
  futuro queda en blanco (la incertidumbre compuesta convertiría el año en ficción).
  Confianza `low` = solo el próximo ciclo.
- **Detalle de día = sheet:** resumen del día (`daily_summary`) + registros de ese día +
  acciones ("registrar aquí", "empezó/terminó mi regla aquí" → plan 03, "editar" → plan
  06). La ruta `diary/[date]` renderiza este mismo detalle (deep-linkable).
- **Modo discreto** (`discreet_calendar`): marcadores sin etiquetas ni colores de fase
  para cuando la pantalla se comparte; se activa en privacidad (plan 13).
- **Leyenda educativa** accesible desde el header: qué significa cada marcador y por qué
  el futuro se dibuja distinto.

## Señal → valor

Superficie de salida: convierte `daily_summary` + `cycle_predictions` en orientación
temporal. Los puntos de registro devuelven constancia visible sin gamificarla.

## Fases

### [ ] Fase 1: Diseño

- **Objetivo:** el lenguaje visual aprobado antes de RN.
- **Cambios:** `docs/design-system/screens/calendario.html` — mes en ciclo (observado +
  predicho + fértil), embarazo, modo discreto, sheet de día; light+dark.
- **No hacer:** código.
- **Cierre:** revisión visual; el test del vistazo: nadie confunde observado con
  estimado.

### [ ] Fase 2: Mes real

- **Objetivo:** el grid lee el motor.
- **Cambios:** componente de mes con `useDailySummary(rango del mes)` +
  `useCurrentPrediction`; navegación entre meses (virtualizada, sin cargar el año
  entero); marcadores según el lenguaje visual; horizonte de 3 ciclos.
- **No hacer:** sheet de día (fase 3); scroll infinito de años.
- **Cierre:** con fixtures, un mes con regla observada + predicción se pinta correcto
  en ambos temas (test de render); rendimiento fluido al cambiar de mes en dispositivo.

### [ ] Fase 3: Detalle de día + discreción

- **Objetivo:** el día se abre, se entiende y se actúa.
- **Cambios:** sheet de día (resumen + registros + acciones); `diary/[date]` renderiza
  el mismo detalle; modo discreto aplicado; leyenda educativa.
- **No hacer:** edición inline (las acciones navegan a sus dueños: planes 02/03/06).
- **Cierre:** QA — tocar un día pasado muestra sus datos reales; "empezó mi regla aquí"
  crea la racha y el mes se repinta al instante; modo discreto oculta todo lo íntimo.

## Riesgos y preguntas abiertas

- **Saturación de marcadores** (regla + fértil + registro + hoy en la misma celda):
  resolver en el mockup con jerarquía clara; máximo dos capas visibles por celda.
- **Accesibilidad:** los marcadores no pueden depender solo del color (forma + etiqueta
  para lectores de pantalla).
