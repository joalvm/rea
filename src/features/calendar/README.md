# Feature: Calendario

Rejilla mensual visual pero **no sobrecargada**, alimentada por el read model `daily_summary`.

Ruta: `src/app/(tabs)/calendar.tsx` · Componente: `src/features/calendar/Calendar.tsx` ·
Fase: **P2**.

## Celda de día (DayCell)

Desde `daily_summary`:

- Color de fondo por **fase** (`estimated_phase`) y por **menstruación**
  (`is_menstruation_day`, `menstruation_basis`, `is_spotting_day`).
- Marcadores **discretos**: `had_medication`, `had_intercourse`, síntoma fuerte
  (`max_symptom_intensity` / `top_symptom_key`).
- **Overlay de predicción** para días futuros (próxima regla, `fertile_window`,
  `estimated_ovulation`) con estilo **estimado** (tenue/punteado) — honestidad.

## Interacción

- Tap en un día → `diary/[date]` (detalle), no edición directa.
- Navegación de mes, salto a "hoy", leyenda de colores/marcadores.
- Desde aquí se accede a **editar/confirmar periodo** (ver feature `period`):
  p. ej. "Rea detectó sangrado 3 días, ¿fue tu periodo?".

## UX / privacidad

Observado = sólido; estimado = tenue. Símbolos discretos para sexo/salud íntima (la vista
mensual es visible "de golpe").

## Pendiente

Grid mensual, render de celdas, navegación de mes, leyenda, overlay de predicción.
