# 11 · Contenido (tips, educación, avisos)

> **Hito:** fase 1 (embarazo mínimo) en **M3**; semanal completo en M6; corpus de ciclo
> en M7 · **Depende de:** 01 (fase/confianza), 09 (semana) · **Estado:** 🚧 corpus
> semanal mínimo, fuentes y evaluador AND conectados; faltan guardados y tarjeta en Hoy.

## Contexto

El contenido es lo que acompaña a los dos pilares: la usuaria no solo registra —
entiende. Tres reglas lo definen frente a cualquier blog de app comercial: **todo item
cita fuente** (`content_sources`), **recomienda, jamás diagnostica**, y **se dispara por
contexto real** (fase, síntoma, semana, modo), no por engagement.

## Decisiones base

- **El seeder es el CMS:** los items viven en un seeder versionado (ids estables,
  `content_version` para re-mostrar si el texto cambia) y sus textos en
  `lang/{es,en}/content.json` (claves `title_key`/`body_key`). Sin backend, sin
  descargas: el corpus viaja con la app.
- **Reglas como AND:** múltiples `content_rules` de un item deben cumplirse todas
  (fase = lútea AND dolor ≥ 3). El evaluador vive en `src/domain/content/` — puro,
  entra el contexto del día, salen candidatos ordenados por prioridad.
- **Respeto a la atención:** una tarjeta en Hoy como máximo; lo descartado no reaparece
  (hasta nueva `content_version`); `min_confidence` evita contenido predictivo cuando el
  motor no da la talla.
- **Guardados:** corazón en cada item (`saved_at` en `content_delivery_log`); la
  biblioteca "Aprender" lista guardados, por fase y por tema.
- **Todo item pasa la checklist editorial** (`docs/contenido-guia.md`, nace en fase 1):
  fuente citada y vigente, tono "recomienda, no manda", sin diagnóstico, sin culpa,
  es/en revisados en frío.

### Corpus objetivo (~130 items en es; en = traducción)

| Bloque                               | Items | Ejemplo                                                     |
| ------------------------------------ | ----- | ----------------------------------------------------------- |
| Fase × modo (educación base)         | 16    | "Fase lútea: por qué el sueño cambia"                       |
| Tips por síntoma frecuente           | 24    | Dolor ≥3 en menstrual → calor local, evidencia              |
| TTC (TWW, BBT, OPK, moco)            | 12    | "DPO 6: qué es implantación (y qué no sabemos)"             |
| Evitar (marco conservador)           | 6     | "Por qué la ventana se muestra más ancha en tu modo"        |
| **Embarazo por rangos (fase 1, M3)** | 12    | Semanas 1-4, 5-8, … 37-42: desarrollo + señales de consulta |
| Embarazo semanal completo (M6)       | 42    | Una por semana, reemplaza al rango                          |
| Alertas (recomendación de consulta)  | 8     | Movimiento reducido ≥28 sem; sangrado en embarazo           |
| Método hormonal                      | 4     | "Qué registra REA cuando tu método suprime la ovulación"    |
| Trivia/educación general             | 8     | "Cuánto dura un ciclo 'normal' según la evidencia"          |

## Señal → valor

El contenido **es** la devolución de valor de muchas señales (síntoma registrado → tip
con fuente; semana → desarrollo). El log de entregas + guardados dice qué contenido
sirve — señal editorial para iterar el corpus.

## Fases

### [ ] Fase 1 (M3): Evaluador + embarazo mínimo

- **Objetivo:** la usuaria embarazada tiene acompañamiento semanal desde M3.
- **Cambios:** `src/domain/content/` (evaluador AND + prioridad + log de entrega);
  seeder de fuentes + 12 items de embarazo por rangos + 8 alertas; tarjeta en Hoy
  conectada (plan 04); `lang/{es,en}/content.json`; `docs/contenido-guia.md` con la
  checklist.
- **No hacer:** biblioteca Aprender; corpus de ciclo.
- **Cierre:** test del evaluador (reglas AND, versión, descartes); semana 22 seed
  muestra el rango 21-24 en Hoy; toda fila de item tiene fuente (test).

### [ ] Fase 2 (M6): Semanal completo

- **Objetivo:** las 42 semanas, una a una.
- **Cambios:** 42 items semanales (sustituyen a los rangos); superficie de semana en la
  pantalla de embarazo (plan 09); revisión editorial completa.
- **No hacer:** contenido multimedia (texto + iconografía basta en v1).
- **Cierre:** cada semana 1-42 resuelve exactamente un item (test); checklist pasada.

### [ ] Fase 3 (M7): Corpus de ciclo + Aprender

- **Objetivo:** los dos pilares con corpus completo y biblioteca.
- **Cambios:** resto del corpus (fase×modo, síntomas, TTC, evitar, hormonal, trivia);
  pantalla Aprender (mockup primero): explorar por fase/tema, guardados, `content/[id]`
  como detalle con fuente visible.
- **No hacer:** búsqueda full-text (criterio de entrada: corpus > 200 items);
  recomendaciones "para ti" más allá de las reglas.
- **Cierre:** QA de disparos por perfil seed (síntoma, fase, TTC); guardar/desguardar
  persiste; fuentes visibles en cada detalle.

## Riesgos y preguntas abiertas

- **Escribir 130 items con fuente es el costo real** (más que el código): presupuestar
  como trabajo editorial por bloques; la checklist es el control de calidad.
- **Fuentes que caducan:** `reviewed_at` en fuente e item; revisión anual del corpus
  como tarea recurrente.
- **Tono de alertas:** "consulta a tu profesional" sin asustar — lectura en frío
  obligatoria; jamás nombrar diagnósticos como conclusión.
