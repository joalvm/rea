# Feature: Estadísticas

Tab **segmentada**. No "charts por tener charts": cada sección responde una pregunta útil.
Ya andamiada en 3 componentes (segmentos): `statistics/` (resumen), `predictions/`, `tips/`.

Ruta: `src/app/(tabs)/stats.tsx` · Componentes: `src/features/statistics/*` · Fase: **P2**.

## Secciones

1. **Ciclo** — duración/variabilidad y sangrado (de `period_runs`); próxima regla estimada;
   precisión de predicciones (requiere `prediction_snapshots`, V1).
2. **Fases** — desde `daily_summary.estimated_phase`: días por fase, estado promedio por fase,
   síntomas comunes por fase ("en lútea sueles registrar más cansancio").
3. **Síntomas** — frecuencia e intensidad (de `checkin_symptoms` + `symptom_catalog`).
4. **Ánimo / energía / estrés** — promedios por fase y por día del ciclo.
5. **Medicación** — más usados y alivio reportado (`checkin_medications.relief`).
6. **Búsqueda de embarazo** (solo si TTC) — ventana fértil estimada, relaciones dentro/fuera,
   patrón de moco cervical. **Sin** porcentajes de éxito.
7. **Señales para consultar** — checklist informativo, **no diagnóstico** (sangrado abundante,
   dolor que interfiere, ciclos muy largos/cortos, manchado entre periodos, sangrado tras
   relaciones, etc.).

## Segmentos

- **Predicciones**: próxima regla, ventana fértil/ovulación con **confianza + disclaimer**.
- **Tips**: biblioteca de `content_items` (educational/trivia) por tema, con su fuente
  (`content_sources`). Contenido mostrado aquí se registra con `surface='statistics'`.

## Pendiente

Control segmentado, charts, motor de predicción, matcher de contenido, estados vacíos honestos.
