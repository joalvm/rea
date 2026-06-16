# Rea — Plan de producto, vistas y roadmap

> Documento maestro de producto/UX. La fuente de verdad de datos es el esquema
> Drizzle en `src/db/schema/*` (el runtime construye la DDL desde ahí; `schema.sql`
> es copia humana de referencia). Cada feature tiene además su propio `README.md`
> en `src/features/<area>/` con el detalle de pantalla.

## 1. Qué es Rea

App local-first de seguimiento menstrual para mujeres. Permite:

- Seguir el periodo y la fase del ciclo a partir **solo de lo que la usuaria registra**.
- Cuantificar ánimo, energía, dolor, síntomas, etc. para **estimar** (nunca afirmar) la
  próxima regla y la ventana fértil.
- Acompañar la **búsqueda de embarazo** (TTC) y el **embarazo** (pausa de predicciones).
- Dar contenido educativo por fase **con fuentes oficiales/científicas**.

**Disclaimer permanente:** Rea no diagnostica, no garantiza fechas exactas y no es
método anticonceptivo. Sus estimaciones pueden equivocarse.

## 2. Principios de producto / UX

Derivados del esquema, no inventados:

1. **Honestidad de la predicción.** `daily_summary.phase_source` y `phase_confidence`
   existen para esto. Nunca "estás ovulando"; sí "fase lútea estimada · confianza media".
   Observado = sólido; estimado = tenue/punteado. Toda predicción ofrece **"¿por qué Rea
   cree esto?"** (último periodo, ciclo declarado, regularidad, datos recientes, confianza).
2. **Privacidad como producto.** Datos en el dispositivo (SQLite, sin red). Se comunica en
   onboarding y en el centro de privacidad. Marcadores **discretos** para sexo/salud íntima.
3. **Corrección fácil.** `period_runs.status/source` permiten confirmar/excluir/reclasificar.
   `checkins.excluded_from_summary` permite "no contar" sin borrar.
4. **Estados vacíos honestos.** Sin 2-3 ciclos no se finge precisión: "Rea necesita más
   registros para darte patrones personales".
5. **Captura sin fricción.** `symptom_catalog.is_quick_option` para accesos rápidos; varios
   check-ins por día; check-in como **wizard segmentado**, no lista gigante.
6. **No diagnóstico.** Alertas y "señales para consultar" son informativas, no alarmistas.

## 3. Auditoría del esquema

### Deltas aplicados (esta iteración)

- `checkin_medications.relief` → **nullable** (`src/db/schema/checkinMedication.ts`).
  Permite registrar la toma sin saber aún si alivió y completar el alivio después.
- `checkins.excluded_from_summary` **INTEGER NOT NULL DEFAULT 0** (`src/db/schema/checkin.ts`).
  "No contar en estadísticas" sin borrar (distinto de `deleted_at`). El recálculo de
  `daily_summary` debe filtrar `WHERE excluded_from_summary = 0 AND deleted_at IS NULL`.
- `DATABASE_VERSION` 1 → 2 (`src/db/config.ts`): el cambio fuerza reset total en arranque
  (proyecto sin usuarias todavía; no hay migraciones). `schema.sql` se sincronizó a v2.

### Diferidos (decisión de alcance)

- `prediction_snapshots` (medir precisión histórica de predicciones) → **V1**.
- `daily_notes` (nota a nivel de día, no de check-in) → opcional, post-MVP. Por ahora se usa
  `checkins.note`.
- `notification_log` (saber si la usuaria ignoró/respondió) → opcional, post-MVP.

### Nota de integridad de contenido

`content_delivery_log.surface` solo admite `('today','day_detail','statistics')`. Si se añade
una biblioteca **"Aprender"** como superficie registrable, hay que **extender ese enum**
(o no registrar esas vistas en el log).

### Lo que el esquema ya soporta sin tocar

Perfil + recordatorios (`user_profile`), contexto reproductivo versionado
(`reproductive_intent_history`), periodos (`period_runs`), embarazo (`pregnancy_episodes`),
check-ins multi-diarios (`checkins`), síntomas (`symptom_catalog` + `checkin_symptoms`),
medicación (`medication_catalog` + `checkin_medications`), relaciones (`intercourse_log`),
read model diario (`daily_summary`) y motor de contenido
(`content_sources/items/rules/delivery_log`).

## 4. Arquitectura de navegación (andamiada)

```
src/app/
  index.tsx                gate: lee user_profile.onboarding_completed_at (DB) → onboarding | tabs
  _layout.tsx              root Stack + DatabaseProvider
  +not-found.tsx

  (onboarding)/            wizard (Stack)
    welcome · import · birth-year · last-period · cycle · regularity ·
    contraception · goal · notifications · complete

  (tabs)/                  Tab bar (5)
    index (Inicio) · diary (Diario) · calendar (Calendario) · stats (Estadísticas) · settings

  checkin/                 wizard de check-in (Stack, sobre tabs)
    index · bleeding · feelings · body · symptoms · fertility · medications · note · review

  diary/[date].tsx         detalle de día (lectura + acceso a registrar)
  period/edit · period/confirm
  content/[id].tsx
  settings/                cycle-profile · notifications · medications · privacy ·
                           pregnancy · sources · about
```

Componentes en `src/features/<area>/<pantalla>/`. Placeholder neutral compartido:
`src/components/screen-placeholder/ScreenPlaceholder.tsx` (sin diseño aún; cada pantalla
queda navegable y autoexplicada). El "qué va en cada vista" se detalla en el README de la
feature.

## 5. Inventario de vistas → esquema

| Vista | Lee | Escribe |
|---|---|---|
| Inicio (Home) | `daily_summary`, `period_runs`, intención, contenido `surface='today'` | — (log de entrega) |
| Diario | `checkins` (+síntomas/medicación del día), `daily_summary` | editar/excluir/borrar check-in |
| Detalle de día `diary/[date]` | todo lo del día + contenido `surface='day_detail'` | — |
| Calendario | `daily_summary` (mes) | — |
| Estadísticas | `period_runs`, `daily_summary`, `checkin_*`, contenido `surface='statistics'` | log de entrega |
| Check-in (wizard) | catálogos | `checkins`, `checkin_symptoms`, `checkin_medications`, `intercourse_log`, `period_runs` → recompute `daily_summary` |
| Editar/confirmar periodo | `period_runs` | `period_runs` (status/source/fechas) |
| Configuración › Mi contexto | `reproductive_intent_history` | nueva versión (cierra la vigente) |
| Configuración › Recordatorios | `user_profile` | `user_profile.reminder_*` |
| Configuración › Medicamentos | `medication_catalog` | CRUD catálogo |
| Configuración › Modo embarazo | `pregnancy_episodes` | inicio/fin (pausa predicciones) |
| Configuración › Privacidad | — | export/import/borrar; bloqueo PIN |
| Contenido `content/[id]` | `content_items` + `content_sources` | — |

## 6. Roadmap por fases

**Alcance MVP decidido:** núcleo + **modo embarazo** + **TTC/fertilidad**.
Centro de privacidad → P3. `prediction_snapshots` → V1.

- **P0 — Cimientos (hecho)**: gate por DB, deltas de esquema, `ScreenPlaceholder`, rutas y
  features andamiadas, arreglo del typo `wellcome`.
- **P1 — Núcleo (MVP)**: onboarding real (persiste `user_profile` + `reproductive_intent_history`
  + primer `period_run`); **wizard de check-in** real (incl. paso de fertilidad condicional);
  recálculo de `daily_summary` al guardar; Hero de Inicio + Diario.
- **P2 — Visualización**: Calendario mensual (fases + predicción, estilo honesto); Estadísticas
  segmentada; motores de predicción y de contenido (3 superficies); detalle de contenido;
  editar/confirmar periodo.
- **P3 — Sensible**: TTC/fertilidad diferenciado en todas las superficies; modo embarazo
  completo; centro de privacidad (export/import/borrar, bloqueo PIN/biometría).
- **V1+**: `prediction_snapshots` + precisión; reporte para profesional médico; biblioteca
  "Aprender"; notificaciones inteligentes por patrón.

## 7. Motores / servicios pendientes (no son vistas)

1. **Recálculo de `daily_summary`** (proyección desde `checkins`/`period_runs`/`intercourse_log`;
   produce `estimated_phase` + `phase_source` + `phase_confidence`).
2. **Motor de predicción** (próxima regla, ventana fértil/ovulación) sobre `period_runs` + intención.
3. **Matcher de `content_rules`** (selección por fase/síntoma/umbral/intención) + dedupe vía
   `content_delivery_log`.
4. **Scheduler de recordatorios** (expo-notifications) según `user_profile.reminder_*`.
5. **i18n `src/lang`** — resuelve todos los `*_key` (labels de síntomas, contenido, etc.).
6. **Export/import** (serialización local) para onboarding y privacidad.

## 8. Estado del andamiaje (esta iteración)

Hecho: esquema (deltas), gate por DB, wizard de onboarding (10 pasos) navegable, wizard de
check-in (9 pasos) navegable, detalle de día, periodo (editar/confirmar), contenido, 7
subpantallas de configuración, tabs cableadas (Inicio→check-in, Configuración→subrutas).
Verificado: `jest` 85/85, `tsc --noEmit` limpio, `expo lint` limpio.

Pendiente: toda la UI real (los placeholders usan `ScreenPlaceholder`), los motores del
punto 7 y la persistencia real en cada flujo.
