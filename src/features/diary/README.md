# Feature: Diario

Cubre dos pantallas: la **tab Diario** (día actual) y el **detalle de día** `diary/[date]`.
Debe sentirse como un diario íntimo, no como una tabla.

Rutas: `src/app/(tabs)/diary.tsx`, `src/app/diary/[date].tsx` ·
Componentes: `src/features/diary/diary/`, `src/features/diary/entry/` · Fase: **MVP**.

## Tab Diario (hoy)

- **Header del día**: fecha + fase estimada + confianza.
- **Resumen emocional**: desde `daily_summary` (ánimo/energía/estrés/dolor máx/síntoma top).
- **Timeline de check-ins**: cada `checkins` como card (hora, ánimo, dolor, síntomas, nota).
  Acciones por card:
  - Editar.
  - Eliminar (`deleted_at`).
  - **No contar en estadísticas** (`excluded_from_summary = 1`) — distinto de eliminar.
- **Mini-gráficos intradía** (aprovecha varios check-ins/día): ánimo, dolor, energía/estrés.

## Detalle de día `diary/[date]`

Lectura de un día concreto + acceso a registrar:

- Fase estimada del día + confianza.
- Check-ins, síntomas, medicación y relaciones de ese día.
- Consejo del día: contenido `surface='day_detail'`.
- Botón "hacer check-in" → `/checkin`.

## Datos

`checkins`, `checkin_symptoms`, `checkin_medications`, `intercourse_log`, `daily_summary`,
`content_delivery_log`. Tocar un día en Calendario navega aquí.

## Pendiente

Listado/timeline real, edición y exclusión de check-ins, mini-gráficos, render del detalle de día.
