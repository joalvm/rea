# Feature: Check-in (wizard)

Registro segmentado de cómo se siente la usuaria. **No es un modal ni una lista gigante**:
es un wizard por pasos (como el onboarding). Se pueden hacer **varios check-ins al día**.

Rutas: `src/app/checkin/*` (Stack sobre las tabs) · Componentes:
`src/features/checkin/<paso>/` · Fase: **MVP**.

## Modos

- **Rápido** (por defecto): estado general, sangrado, síntomas principales, nota.
- **Completo**: todos los pasos. Acceso desde "Agregar más detalles".

## Pasos → esquema

| Paso | Pantalla | Campos → tabla |
|---|---|---|
| 0 | intro | Elegir modo rápido/completo. |
| 1 | bleeding | `bleeding_intensity` (0-4), `clots` (0-3), `period_status_signal` (started/ongoing/ended). Puede crear/actualizar `period_runs`. |
| 2 | feelings | `mood` (1-5), `energy` (1-5), `stress_level` (0-5). |
| 3 | body | `pain_intensity` (0-5), `pain_interference` (0-3), `breast_sensitivity` (0-5), `pms_intensity` (0-5). |
| 4 | symptoms | `symptom_catalog` (quick options primero, agrupado por `group_key`) + intensidad (1-5) → `checkin_symptoms`. |
| 5 | fertility | **Condicional** (`trying_to_conceive` && !`hormonal_contraception`): `cervical_mucus` (0-4), `libido` (0-4), registrar relación → `intercourse_log`. |
| 6 | medications | `medication_catalog` + `dose_note` + `relief` (0-2, **opcional/nullable**) → `checkin_medications`. |
| 7 | note | `checkins.note`. |
| 8 | review | Resumen + guardar. |

## Comportamiento esperado (al guardar en `review`)

1. Insertar el `checkins` (instante `recorded_at`, día `local_date`).
2. Insertar `checkin_symptoms` / `checkin_medications` / `intercourse_log` asociados.
3. Aplicar `period_status_signal` sobre `period_runs` (abrir/cerrar racha).
4. **Recalcular `daily_summary`** del `local_date`.

El estado del formulario debe compartirse entre pasos (un store/contexto del wizard).

## UX

- Escalas con etiquetas suaves/emojis, no examen clínico.
- `pain_interference` ("¿te impidió hacer algo?") distingue dolor leve de dolor que afecta.
- Fertilidad: copy de **señal**, nunca de certeza ("puede aparecer cerca de días fértiles").
- `relief` opcional → permite "tomé X" y preguntar el alivio después (notificación).

## Pendiente

Form state del wizard, UI de cada paso, persistencia transaccional, recompute de
`daily_summary`, modo rápido vs completo, salida del wizard hacia su origen.
