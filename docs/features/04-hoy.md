# 04 · Hoy (home)

> **Hito:** M3 · **Depende de:** 01 (motor), 03 (propuestas de periodo), 09 fase 1
> (semana de embarazo) · **Estado:** 🚧 superficie viva de motor; faltan propuestas
> de periodo y tarjeta contextual de contenido.

## Contexto

Hoy es la pantalla que la usuaria abre por defecto. Tiene que responder tres preguntas
en un vistazo, sin que ella toque nada: **¿dónde estoy?** (fase o semana), **¿qué
viene?** (próximo evento relevante) y **¿qué hago ahora?** (registrar, confirmar,
leer). Todo lo que muestra sale del motor; Hoy no calcula nada.

## Decisiones base

- **Hero por modo:** en ciclo — fase, día del ciclo y confianza visible ("día 18 ·
  lútea · estimado"); en embarazo — semana y cuenta ("semana 22 · faltan ~18"); en
  posparto — estado honesto ("esperando tu primera regla", sin cuenta regresiva
  inventada). El hero usa `PhaseColors` del theme y a Rea (la protagonista) como
  presencia, no como decoración ruidosa.
- **La honestidad viaja con cada dato:** todo lo estimado se marca (`phase_source`,
  confianza); en retraso el hero dice "retraso, día N" y jamás una nueva fecha
  inventada.
- **Próximo evento según modo e intención:** regla estimada (tracking), ventana fértil
  (TTC la busca, evitar la señala con marco conservador), próxima semana (embarazo).
  Con confianza `low`, rangos en vez de días exactos.
- **Las propuestas del plan 03 viven aquí:** banner de confirmación ("¿empezó tu
  regla?") con prioridad sobre el contenido.
- **Resumen del día:** chips de lo ya registrado hoy (check-in count, síntomas top,
  medicación) + CTA de registrar si aún no hay nada.
- **Una tarjeta de contenido, no un feed:** el contenido contextual del plan 11 asoma
  con una sola tarjeta descartable; Hoy no compite con Aprender.
- **Ajustes se alcanza desde el header** (icono), según la arquitectura de información
  del [índice](README.md).

## Señal → valor

Hoy es superficie de salida: devuelve a la usuaria el valor de lo que registró (fase
confiable, próximos eventos, su día resumido). Su métrica es que la respuesta esté en
pantalla sin scroll.

## Fases

### [ ] Fase 1: Diseño

- **Objetivo:** mockup de los cuatro estados aprobado antes de RN.
- **Cambios:** `docs/design-system/screens/hoy.html` — ciclo (con y sin datos), TTC,
  evitar, embarazo, posparto, retraso; light+dark.
- **No hacer:** código.
- **Cierre:** revisión visual aprobada.

### [x] Fase 2: Hero + próximos eventos reales

- **Objetivo:** Hoy lee el motor y expone la procedencia de sus datos.
- **Cambios:** `HomeScreen` real con `useTodaySummary` + `useCurrentPrediction` +
  `useActiveIntent`; hero por modo; tarjeta de próximo evento con confianza; se elimina
  el selector temporal y el namespace provisional de `lang/`.
- **No hacer:** contenido (fase 3); pull-to-refresh (live query ya refresca).
- **Cierre:** con fixtures de datos, cada modo muestra su hero correcto (test de
  render); no queda namespace provisional en `src/` ni `lang/`.

### [x] Fase 3: Día vivo

- **Objetivo:** el resto de la pantalla acompaña.
- **Cambios:** chips de resumen del día; banner de propuestas del plan 03; CTA de
  registro; hueco de tarjeta de contenido (se conecta en el plan 11); saludo con nombre
  de `user_profile`.
- **No hacer:** más de una tarjeta de contenido; estadísticas embebidas (plan 07).
- **Cierre:** QA en dispositivo de un día completo: registrar → chips al instante;
  propuesta de periodo aparece y se resuelve desde Hoy.

## Riesgos y preguntas abiertas

- **Densidad:** tres preguntas ≠ tres pantallas de widgets; si algo no responde una de
  las tres preguntas, no entra.
- **Confianza baja prolongada** (usuaria irregular): el hero debe seguir siendo útil
  sin fecha — "fase lútea probable" es mejor que "día –" y que un número falso.
