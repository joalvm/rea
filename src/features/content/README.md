# Feature: Contenido

Detalle de una pieza educativa con su **respaldo/fuente**. La confianza depende de mostrar de
dónde sale cada consejo.

Ruta: `src/app/content/[id].tsx` · Componente: `src/features/content/detail/` · Fase: **P2**.

## Qué muestra

De `content_items` (+ `content_sources`):

- Título y cuerpo (claves i18n `title_key` / `body_key`, resueltas en `src/lang`).
- Tipo (`tip`, `trivia`, `recommendation`, `educational`, `alert`) y tema.
- **Fuente**: `content_sources` (tipo, referencia, `source_url`, `reviewed_at`).
- Sello permanente "no es diagnóstico".

## Cómo se entrega (motor)

- `content_rules` selecciona ítems por disparador (`phase`, `symptom`, `metric_threshold`,
  `reproductive_intent`, `contraception`, `general`).
- `content_items.min_confidence` se compara con `daily_summary.phase_confidence`: no aconsejar
  a ciegas cuando la fase es incierta.
- Cada vez que se muestra se registra en `content_delivery_log` (evita repetir, permite rotar).

## Superficies

`content_delivery_log.surface` admite **solo** `today`, `day_detail`, `statistics`. Una
biblioteca "Aprender" como superficie registrable requeriría **extender ese enum**.

## Pendiente

Render real + i18n, integración con el matcher de reglas, registro de entrega, y (opcional)
la biblioteca "Aprender".
