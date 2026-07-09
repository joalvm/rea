# 08 · Fertilidad y TTC (buscar embarazo)

> **Hito:** M5 · **Depende de:** 01 (motor), 02 (captura de BBT/OPK/moco/relaciones),
> 07 (primitivas de gráfica) · **Estado:** 🔲 sin superficie propia; vive como sección
> de Estadísticas + tarjetas en Hoy.

## Contexto

TTC es el modo donde la usuaria más invierte (termómetro cada mañana, tests, atención
al cuerpo) y donde una app puede hacer más daño: dar falsas seguridades o convertir la
búsqueda en ansiedad. REA acompaña con evidencia y marco emocional cuidadoso — y en el
espejo del mismo motor, el modo **evitar** usa estas piezas con el marco opuesto:
conservador y con descargo permanente.

## Decisiones base

- **La gráfica BBT es la pieza central:** puntos diarios, coverline cuando la regla
  3-sobre-6 confirma (plan 01), sombreado de ventana fértil, marcadores de OPK+ y moco
  pico, tomas tardías atenuadas (hora de toma). Zoom por ciclo, comparación con el
  anterior.
- **DPO y TWW con cuidado:** confirmada la ovulación, Hoy (en TTC) muestra "DPO 6"; la
  two-week wait es contenido de acompañamiento (plan 11), no cuenta regresiva ansiosa.
  Nunca "test recomendado hoy" antes de DPO 10 — y como sugerencia de contenido, no
  notificación.
- **Timing informativo, jamás puntuación:** relaciones marcadas sobre la ventana
  ("3 en tu ventana fértil este ciclo"); nada de scores de probabilidad de embarazo ni
  "optimiza tus días". La evidencia por acto no da para eso y el daño emocional sí.
- **Modo evitar = mismas piezas, marco conservador:** ventana ensanchada (−7…+2, plan
  01), lenguaje de riesgo en vez de oportunidad, y **descargo persistente** (no
  descartable) en toda superficie de fertilidad: "la ventana fértil no es un método
  anticonceptivo". Con método hormonal: sección de fertilidad reemplazada por la
  explicación de supresión.
- **Educación sintotérmica integrada:** qué es la coverline, por qué el moco importa —
  contenido con fuente (plan 11) enlazado desde la propia gráfica.

## Señal → valor

| Señal              | Qué produce                                                                 |
| ------------------ | --------------------------------------------------------------------------- |
| BBT diaria (+hora) | Coverline → ovulación confirmada → lútea personal → predicción mejor        |
| OPK                | Ancla de ovulación sin termómetro; marcador en gráfica                      |
| Moco / posición    | Evidencia observada de ventana; sube confianza                              |
| Relaciones         | Timing informativo TTC; conciencia (nunca "seguridad") en evitar            |
| Test de embarazo   | Cierre del ciclo TTC: positivo → puente (plan 10); negativos sin dramatizar |

## Fases

### [ ] Fase 1: Diseño

- **Objetivo:** gráfica y marcos emocionales aprobados en mockup.
- **Cambios:** `docs/design-system/screens/fertilidad.html` — gráfica BBT completa
  (coverline, marcadores, tardías), vista TTC vs vista evitar (con descargo), estado
  hormonal; light+dark.
- **No hacer:** código.
- **Cierre:** revisión visual; lectura en frío del copy de evitar.

### [ ] Fase 2: Gráfica BBT real

- **Objetivo:** la temperatura se ve y se entiende.
- **Cambios:** componente de gráfica sobre las primitivas del plan 07; datos de
  `checkins` + ovulación/coverline del motor; sección "Fertilidad" en Estadísticas
  (TTC/evitar); conversión °C/°F según `temperature_unit`.
- **No hacer:** DPO/TWW (fase 3); edición de datos desde la gráfica.
- **Cierre:** fixtures de ciclo confirmado y no confirmado renderizan correcto (test);
  QA de zoom/scroll en dispositivo.

### [ ] Fase 3: DPO, timing y marco de evitar

- **Objetivo:** el acompañamiento diario de ambos modos.
- **Cambios:** tarjeta DPO en Hoy (TTC, post-confirmación); relaciones sobre la ventana
  en la sección; marco completo de evitar (ventana ensanchada visible, descargo
  persistente, supresión hormonal).
- **No hacer:** scores, probabilidades, "mejores días" prescriptivos.
- **Cierre:** QA por modo — TTC ve DPO; evitar ve riesgo + descargo fijo; hormonal ve la
  explicación; es/en.

## Riesgos y preguntas abiertas

- **Ansiedad TTC:** revisar cada string con la pregunta "¿esto acompaña o presiona?";
  la TWW jamás genera notificaciones.
- **Evitar como anticoncepción:** el descargo persistente es innegociable; si algún
  copy sugiere seguridad, es bug de severidad alta.
- **Datos escasos** (BBT intermitente): la gráfica muestra huecos como huecos; no
  interpola sin decirlo.
