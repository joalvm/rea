# Feature: Periodo (corrección)

Flujos de corrección/confirmación de rachas menstruales. La facilidad de corregir es clave
para que Rea sea útil y fiable.

Rutas: `src/app/period/edit.tsx`, `src/app/period/confirm.tsx` ·
Componentes: `src/features/period/*` · Fase: **P2**.

Se llega desde el Calendario, el detalle de día o una alerta de Inicio.

## Pantallas

- **edit** — editar un `period_runs`: cambiar inicio/fin, marcar como **manchado** (no periodo),
  **excluir** el episodio. Usa `status` (`open`/`closed`/`excluded`).
- **confirm** — confirmar un periodo **inferido** por sangrado (`source = bleeding_inferred`):
  - "Sí, fue mi periodo" → `source = user_confirmed`.
  - "No, fue manchado" → reclasificar.
  - "No contar" → `status = excluded`.

## Comportamiento

Cualquier cambio en `period_runs` debe **recalcular `daily_summary`** de los días afectados
(la menstruación y la fase dependen de las rachas). Respetar los índices de integridad:
a lo sumo una racha `open` por usuaria.

## Pendiente

UI de edición de fechas, reclasificación, confirmación de inferidos, recompute tras cambios.
