# 07 · Estadísticas

> **Hito:** M4 · **Depende de:** 01 (motor, `cycle_records`), 02 (captura) ·
> **Estado:** 🔲 stub.

## Contexto

Aquí se paga la promesa central: **cada dato capturado vuelve como aprendizaje**. Si una
señal del check-in no aparece en ninguna estadística, sobra en el wizard — esta pantalla
es el juez del contrato señal → valor.

Dos reglas la gobiernan: nada se muestra sin datos suficientes para ser honesto
(**gates**), y lo que falta se explica con un estado vacío educativo ("2 de 3 ciclos
para tu curva"), nunca con un hueco.

## Decisiones base

- **Todo widget declara su gate** (mínimo de datos) y su estado vacío educativo. Antes
  del gate, el widget enseña qué registrar para ganárselo.
- **Los ciclos se leen de `cycle_records`**, nunca se re-derivan en la pantalla; las
  curvas por día de ciclo usan `daily_summary.cycle_day`.
- **REA se mide a sí misma:** el widget "Precisión de REA" muestra el error medio de
  predicción (`AVG(ABS(prediction_error_days))` de los últimos 6 ciclos) — la
  honestidad del pilar de predicción, medida con datos reales, visible para la usuaria.
- **Insights personalizados** arriba: frases derivadas de los widgets ("tu fase lútea
  suele durar 13 días", "el dolor aparece sobre todo tu primer día") — máximo 3,
  rotan, cada una trazable a su widget.
- **Gráficas propias en SVG** (`react-native-svg` ya está): barras, línea, área por
  fase. Sin librería de charts — control de tema, accesibilidad y peso.
- **Cálculo en `src/domain/stats/`,** puro y testeado; la pantalla solo pinta.
- **En embarazo cambia el eje:** día de ciclo → semana gestacional (peso y síntomas por
  semana).

## Widgets (con gate y aprendizaje)

| Widget                               | Datos / gate                               | Qué aprende la usuaria                      |
| ------------------------------------ | ------------------------------------------ | ------------------------------------------- |
| Resumen de ciclo                     | ≥2 ciclos válidos                          | Mediana, rango, variabilidad — "mi normal"  |
| Historial de longitudes              | ≥2 ciclos (barras, últimos 12)             | Tendencia y outliers de su ciclo            |
| Duración del periodo                 | ≥2 rachas cerradas                         | Cuánto dura su regla de verdad              |
| Curvas ánimo/energía/estrés/sueño    | ≥2 ciclos con ≥8 check-ins cada uno        | Su patrón emocional por fase                |
| Síntomas por fase                    | ≥15 registros de síntoma                   | "Tus típicos de lútea": anticipación real   |
| Patrón premenstrual                  | ≥2 ciclos con señales en lútea tardía      | Si su PMS es patrón o casualidad            |
| Alivio por medicamento               | ≥5 tomas con alivio registrado             | Qué le funciona, por síntoma                |
| Libido / peso por fase               | ≥2 ciclos con la señal                     | Correlaciones que nadie le contó            |
| Resumen BBT                          | ≥15 tomas en un ciclo (detalle en plan 08) | Si su temperatura confirma ovulación        |
| **Precisión de REA**                 | ≥3 `cycle_records` con predicción emitida  | Cuánto confiar en la app — dicho por la app |
| Embarazo: peso y síntomas por semana | modo embarazo + señales                    | Evolución sin juicio, semana a semana       |

## Fases

### [ ] Fase 1: Diseño + primitivas de gráfica

- **Objetivo:** lenguaje visual de datos aprobado y componentes de gráfica listos.
- **Cambios:** `docs/design-system/screens/estadisticas.html` (widgets con datos, gates
  y vacíos educativos; light+dark); primitivas SVG (`BarChart`, `LineChart`,
  `PhaseBand`) theme-aware en `src/components/ui/`.
- **No hacer:** cálculos.
- **Cierre:** mockup aprobado; primitivas renderizan fixtures en ambos temas (test de
  render).

### [ ] Fase 2: Dominio de estadísticas

- **Objetivo:** todos los números, puros y testeados.
- **Cambios:** `src/domain/stats/` — series por día de ciclo (alineadas día 1..N),
  frecuencia de síntomas por fase, alivio por medicamento, patrón premenstrual,
  precisión de predicción; cada función con su gate como contrato explícito.
- **No hacer:** UI; queries (las filas llegan como argumentos).
- **Cierre:** tests unit con seeds densos; los gates devuelven "insuficiente" con el
  conteo exacto que falta.

### [ ] Fase 3: Pantalla con gates

- **Objetivo:** los widgets de ciclo, vivos.
- **Cambios:** pantalla con read hooks + dominio; estados vacíos educativos con su
  conteo; orden por relevancia del modo (TTC ve fertilidad arriba, etc.).
- **No hacer:** insights (fase 4); export de gráficas.
- **Cierre:** QA con tres perfiles seed (nueva, 3 ciclos, 12 ciclos): cada widget
  aparece exactamente cuando su gate se cumple.

### [ ] Fase 4: Precisión, insights y embarazo

- **Objetivo:** la capa que convierte números en frases.
- **Cambios:** widget Precisión de REA (con explicación de qué significa); generador de
  insights (máx 3, trazables); eje semanal para embarazo.
- **No hacer:** insights especulativos sin widget que los respalde; comparaciones con
  "otras usuarias" (no existen: local-first).
- **Cierre:** cada insight posible tiene test con su fixture; revisión de copy es/en.

## Riesgos y preguntas abiertas

- **Pocas usuarias llegan a 12 ciclos:** los gates bajos (2-3 ciclos) son deliberados;
  el valor temprano es retención.
- **Precisión de REA con predicciones malas:** mostrarla igual — es el pilar. Un error
  medio alto + explicación ("tu ciclo varía mucho; REA acierta ±4 días") es honestidad,
  no fracaso.
- **Rendimiento:** stats se calculan al abrir la pantalla (no en background); si un seed
  de 3 años tarda >100 ms, memoizar por `updated_at` máximo.
