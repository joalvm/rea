# Onboarding

Onboarding de Rea: captura la información mínima para arrancar el motor de ciclo según la intención
reproductiva, y deja marcado `app_settings.onboarding_completed_at` para que el gate redirija a la app.

> **Referencias**
>
> - Decisiones de diseño: [`/DESIGN.md`](../../../DESIGN.md) (sin sombras, botones outlined, sin focus ring, controles custom).
> - Referencia visual: [`docs/design-system/onboarding.html`](../../../docs/design-system/onboarding.html) (mockups de las 10 pantallas en light/dark).
> - Esquemas: `src/db/schema/{profile,appSettings,reproductiveIntentHistory,pregnancyEpisode,periodRun}.ts`.

## 1. Arquitectura — por rutas, sin shell

- Cada pantalla es una **ruta** bajo `src/app/(onboarding)/`. La navegación se decide en el archivo de ruta con `router.push` / `router.replace`.
- `(onboarding)/_layout.tsx` es solo el `Stack` de ruta (cabecera oculta, animación). **No** es un shell con props.
- El estado del borrador vive en el **store efímero** (`shared/stores/useOnboardingStore.ts`, Zustand). Cada pantalla lee y escribe el store directamente.
- Cada `*Screen.tsx` recibe solo los handlers primitivos de navegación que realmente usa (`onPush`, `onReplace`, `onBack`), decide cuándo llamarlos y no conoce `expo-router`.
- Hooks y servicios devuelven handlers/resultados semánticos; no importan `expo-router`.
- La persistencia es **una transacción atómica** al final (`complete/services/completeOnboarding.ts`); los pasos intermedios solo actualizan el store.

## 2. Inventario de pantallas

| #   | Ruta                                  | Captura → DB                                               | Visible para        |
| --- | ------------------------------------- | ---------------------------------------------------------- | ------------------- |
| 01  | `welcome`                             | —                                                          | todos               |
| 02  | `profile` _(repurpose de birth-year)_ | `user_profile.name`, `user_profile.birth_year`             | todos               |
| 03  | `intent` _(4 cards, era goal)_        | `current_mode`, `cycle_intent`                             | todos (bifurca)     |
| 04  | `last-period`                         | `period_runs` (inicio + fin/ongoing)                       | cycle_tracking, ttc |
| 05  | `cycle`                               | `declared_period_length`, `declared_cycle_length`          | cycle_tracking, ttc |
| 06  | `regularity`                          | `regularity`                                               | cycle_tracking, ttc |
| 07  | `contraception`                       | `hormonal_contraception`                                   | **solo track_only** |
| 08  | `pregnancy-setup` _(nueva)_           | `pregnancy_episodes` (FUM, due-date opcional)              | **solo pregnancy**  |
| 09  | `notifications`                       | `app_settings` (reminders + ventana + intervalo)           | todos               |
| 10  | `complete`                            | marca `app_settings.onboarding_completed_at` (transacción) | todos               |

**Eliminadas:** `import` (pantalla + botón "restore" de welcome). Se construye cuando exista el módulo de backup.

## 3. Flujo

```mermaid
flowchart TD
    W[01 welcome] --> P[02 profile]
    P --> I[03 intent]
    I -->|Conocer mi ciclo<br/>track_only| LP[04 last-period]
    I -->|Evitar embarazo<br/>avoid_pregnancy| LP
    I -->|Buscar embarazo<br/>ttc| LP
    I -->|Estoy embarazada<br/>pregnancy| PS[08 pregnancy-setup]
    LP --> CY[05 cycle] --> RG[06 regularity]
    RG -->|track_only| CO[07 contraception]
    RG -->|avoid_pregnancy / ttc| N[09 notifications]
    CO --> N
    PS --> N
    N --> CM[10 complete] -->|replace| APP[/(tabs)]
```

### Bifurcación por intención

| Card elegida       | `current_mode`   | `cycle_intent`    | Pantallas visibles                                                                            |
| ------------------ | ---------------- | ----------------- | --------------------------------------------------------------------------------------------- |
| Conocer mi ciclo   | `cycle_tracking` | `track_only`      | last-period → cycle → regularity → **contraception** → notifications → complete               |
| Evitar embarazo    | `cycle_tracking` | `avoid_pregnancy` | last-period → cycle → regularity → notifications → complete (hormonal forzado `false`)        |
| Buscar un embarazo | `ttc`            | `null`            | last-period → cycle → regularity → notifications → complete (hormonal forzado `false`, CHECK) |
| Estoy embarazada   | `pregnancy`      | `null`            | pregnancy-setup → notifications → complete                                                    |

> `contraception` solo se pregunta en **track_only**: una usuaria en seguimiento neutral podría estar bajo hormonal por otra razón. En `avoid_pregnancy` y `ttc` el valor queda `false` por definición/CHECK.

## 4. Modelo de datos

Tablas que `completeOnboarding` escribe en una transacción:

| Tabla                         | Campos que puebla onboarding                                                                                                                | Notas                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `user_profile`                | `id`, `name`, `birth_year`, `created_at`, `updated_at`                                                                                      | `name` es NOT NULL → se captura en `profile`.                                     |
| `app_settings`                | `user_id`, `reminders_*`, `onboarding_completed_at`, defaults de `theme`/`temperature_unit`                                                 | 1:1 con perfil.                                                                   |
| `reproductive_intent_history` | `current_mode`, `cycle_intent`, `regularity`, `hormonal_contraception`, `declared_cycle_length`, `declared_period_length`, `effective_from` | `effective_from` = día de completar. En `pregnancy` se insertan defaults neutros. |
| `pregnancy_episodes`          | `lmp_date`, `due_date` (opcional)                                                                                                           | Solo si `current_mode = pregnancy`; episodio abierto.                             |
| `period_runs`                 | `start_date`, `end_date` (si no ongoing), `status`, `source=user_confirmed`                                                                 | Solo si conoce su último periodo.                                                 |

Decisiones de mapeo:

- **Regularity**: la UI ofrece 4 opciones; **"Aún no lo sé" → `irregular`** (ventana de predicción más amplia, confianza inicial baja).
- **`effective_from`**: fecha local del día de completar el onboarding (la intención aplica desde hoy; el último periodo queda anclado en `period_runs`).
- **Pregnancy**: row en `reproductive_intent_history` con defaults neutros (`regularity=irregular`, `hormonal_contraception=false`, `declared_cycle_length=28`, `declared_period_length=5`, `cycle_intent=null`) + `pregnancy_episodes` abierto con FUM/due-date.

## 5. Store del borrador

`shared/types/OnboardingDraft.ts`:

```ts
type OnboardingDraft = {
    name: string;
    birthYear: number | null;
    currentMode: "cycle_tracking" | "ttc" | "pregnancy";
    cycleIntent: "track_only" | "avoid_pregnancy" | null;
    lastPeriodStart: string | null; // YYYY-MM-DD
    lastPeriodOngoing: boolean;
    lastPeriodEnd: string | null; // YYYY-MM-DD (si no ongoing)
    cycleLength: number; // 15–90, default 28
    periodLength: number; // 1–15, default 5
    regularity: "regular" | "variable" | "irregular";
    hormonalContraception: boolean; // false salvo track_only
    pregnancyLmp: string | null; // YYYY-MM-DD
    pregnancyDueDate: string | null; // YYYY-MM-DD
    remindersEnabled: boolean;
    reminderWindowStart: string; // "09:00"
    reminderWindowEnd: string; // "22:00"
    reminderIntervalHours: number; // 6
};
```

`useOnboardingStore` (Zustand) expone el draft + setters por campo + `reset()`. Es estado de formulario: **no cachea DB**.

## 6. Hook + servicio de cierre

`complete/hooks/useCompleteOnboarding.ts` resuelve la orquestación del paso final: obtiene la conexión desde infraestructura, llama al servicio, resetea el store y devuelve el resultado a la ruta dueña.

`complete/services/completeOnboarding.ts` — `(database, draft) => Promise<profileId>`, todo en `database.transaction`:

1. Crea `user_profile` (`id` vía `src/db/utils/uuid.ts`).
2. Crea `app_settings` (recordatorios del draft + `onboarding_completed_at = now` + defaults).
3. Crea `reproductive_intent_history` (vigente, `effective_from = hoy`).
4. Si `pregnancy`: crea `pregnancy_episodes` abierto.
5. Si `cycle_tracking`/`ttc` con `lastPeriodStart`: crea `period_runs`.

Patrón inyectable (igual que los seeders) → testeable con libsql `:memory:`.

## 7. Gate de entrada

`src/app/index.tsx` lee `app_settings.onboarding_completed_at` para decidir si redirigir a onboarding o a la app principal.

## 8. Controles custom (componentes hoja, sin shell)

Viven en `src/features/onboarding/shared/components/`, con **una carpeta por componente** y su `*Style.ts` hermano:

- `ProgressIndicator`, `PrimaryButton`, `SecondaryButton`.
- `WheelPicker` (columna scrolleable, fade por color), `DateWheel` (3 wheels d/m/a).
- `SegmentedControl`, `SelectableCard`, `Stepper`, `Switch`, `OutlinedField`.

Contratos visuales y tokens: ver `/DESIGN.md` §3. Si se reusan fuera de onboarding, suben a `src/components/`.

## 9. Fases de implementación

1. **Fase 0 — Diseño** (`DESIGN.md` + `onboarding.html` + este README). ✅
2. **Fase 1 — Controles**: componentes hoja bajo `shared/components/` (`OnboardingScreen`,
   `PrimaryButton`, `ProgressIndicator`, `ScreenTitle/Lead/HelpText/FieldLabel`, `OutlinedField`,
   `WheelPicker`, `DateWheel`, `SegmentedControl`, `SelectableCard`, `Stepper`, `ToggleRow`). ✅
3. **Fase 2 — Estructura**: routes `profile`/`intent`/`pregnancy-setup`, delete `import`, `_layout`
   con la lista nueva y navegación directa desde cada screen usando handlers primitivos de ruta. ✅
4. **Fase 3 — Datos**: `OnboardingDraft` + `useOnboardingStore` (Zustand efímero),
   servicio `completeOnboarding` (transacción), hook `useCompleteOnboarding` y fix del gate (`app_settings`). ✅
5. **Fase 4 — Captura**: cada pantalla lee/escribe el store y usa solo `onPush` / `onReplace` / `onBack`; la ruta dueña ejecuta esas primitivas. ✅
6. **Fase 5 — i18n**: namespace `onboarding` (`src/lang/{es,en}/onboarding.json`), registrado en
   `resources`/`namespaceCatalog`/tipado. ✅
7. **Fase 6 — Tests**: `completeOnboarding` (integración, las 4 intenciones + atomicidad),
   helpers de draft (unit) y validaciones de parches de fecha/selección de regularidad. ✅
8. **Fase 7 — README** final (este archivo). ✅

### Notas de implementación

- **Rutas tipadas**: `app.json` tiene `experiments.typedRoutes`. `.expo/types/router.d.ts` es local
  (gitignored) y lo regenera el bundler al hacer `expo start`; CI corre sin él y `Href` cae a
  `string`. Tras renombrar/crear rutas, arranca Expo una vez para refrescar el autocompletado.
- **Tests + transacciones**: el backend local de `@libsql/client` con `:memory:` recicla la
  conexión tras `db.transaction()` abriendo un `new Database(":memory:")` vacío, lo que borra el
  esquema. Por eso `completeOnboarding` se prueba con `test/utils/createFileDatabase.ts`
  (DB en archivo temporal) y no con `:memory:`.
- **Sin sombras / sin botón sólido / sin focus ring**: los placeholders heredados usaban
  `shadows[*]` y `colors.primary` sólido; el rediseño los elimina (ver `DESIGN.md`).

## 10. Fuera de alcance (por ahora)

- Import/export de backup (botón "restore" de welcome y screen `import` quitados; vuelven con el módulo de backup).
- Motor de predicción (`daily_summary`, `cycle_predictions`).
- Rediseño de pantallas fuera de onboarding.
