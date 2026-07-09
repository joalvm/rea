# Auditoría técnica de REA — julio 2026

Auditoría del estado real del proyecto sobre la rama `refactor/claude-onboarding`.
Cubre: esquema de base de datos, código de aplicación, cumplimiento de los principios
declarados y documentación. Cada hallazgo lleva severidad y propuesta; las propuestas de
esquema se consolidan en la [sección 5](#5-esquema-v3--regeneración-del-maestro).

> Alcance: esquema SQL completo, flujo de onboarding, seeders, `initializeDatabase`,
> `app.json`, dependencias, estructura de features y estándares de `.agents/skills`.

---

## 1. Marco de lectura: producto en construcción

REA se está consolidando. **Solo el onboarding está construido**; todo lo demás —
pantallas, rutas, hasta la forma de los tabs — es andamiaje que puede cambiar. Ese marco
gobierna toda la auditoría:

- **No hay usuarias, luego no hay migraciones.** `initializeDatabase.ts:42` define el
  contrato vigente: si `PRAGMA user_version` no coincide, `resetDatabase()` recrea todo.
  Ese reset **es** el camino correcto mientras no exista una instalación real que
  proteger. Un runner de `ALTER TABLE` por versión sería hoy deuda negativa; su criterio
  de entrada es el primer release público.
- **El esquema se puede rediseñar libremente.** Es la última ventana barata para cubrir
  bien la información que el producto final necesita. Por eso esta auditoría no se
  limita a defectos: revisa cobertura (sección 4).
- **Dos clases de hallazgo, separadas.** Defectos reales (el código o una promesa ya
  contradicen un pilar) y decisiones de modelado abiertas (tablas vacías que conviene
  diseñar bien antes de poblarlas). Mezclarlas inflaría la sensación de deuda.

## 2. Estado real por área

| Área                                     | Estado                                                               | Evidencia                                                                        |
| ---------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Esquema SQL v2 + espejo Drizzle          | ✅ Completo y testeado (v3 pendiente, sección 5)                     | `schema.sql`, `src/db/schema/*.ts`, tests por tabla                              |
| Onboarding (10 pantallas)                | ✅ Completo (ajustes en plan 00)                                     | `src/features/onboarding/**`, validación por paso, transacción atómica           |
| i18n / l10n / theme                      | ✅ Completos                                                         | `src/modules/{i18n,l10n}`, `src/theme/**`, tests                                 |
| Seeder de síntomas                       | ⚠️ 30 síntomas de ciclo, 0 de embarazo, `applicable_mode` sin poblar | `src/db/seeders/symptomCatalogSeeder.ts`                                         |
| Check-in, Hoy, calendario, diario, stats | 🔲 Stubs (~30 líneas por pantalla)                                   | `src/features/**`                                                                |
| Periodo, contenido, ajustes              | 🔲 Stubs                                                             | `src/features/{period,content,settings}/**`                                      |
| Notificaciones                           | ❌ Ausentes (dependencia sin un solo import)                         | `src/modules/notifications/` vacío; grep `expo-notifications` en `src/` = 0 usos |
| Motor de ciclo                           | ❌ Ausente                                                           | Nadie escribe `daily_summary` ni `cycle_predictions`                             |
| Cifrado en reposo                        | ❌ Ausente                                                           | `app.json` usa `expo-sqlite` sin `useSQLCipher`; sin `expo-secure-store`         |
| Refuerzo "cero red"                      | ❌ Ausente (promesa por costumbre, no por build)                     | Sin `blockedPermissions` en `app.json`, sin check en CI                          |
| Backup / exportación                     | ❌ Ausente                                                           | Plan 14                                                                          |

## 3. Defectos reales (contradicen un pilar hoy)

### A1 · Recordatorios prometidos y nunca programados — **Alta**

El onboarding captura preferencias de recordatorio y las persiste en `app_settings`;
nadie pide permiso de notificaciones ni programa nada (`expo-notifications` está en
`package.json` con cero imports; `src/modules/notifications/` está vacío). La usuaria
configura recordatorios que jamás llegan: promesa rota desde el primer día.
→ Plan 12 + ajuste A2 del plan 00 (permiso JIT al completar onboarding).

### A2 · La app escribe datos falsos — **Alta**

Dos caras del mismo pecado, contra el pilar de honestidad; se corrigen juntas:

- **Modo embarazo:** `completeOnboarding.ts:52-55` inserta `regularity='irregular'`,
  `cycleLength=28`, `periodLength=5` inventados porque el esquema exige NOT NULL. Cuando
  esa usuaria pase al posparto, las estadísticas heredan un "ciclo declarado" que nunca
  declaró.
- **Modo evitar:** el onboarding fuerza `hormonal_contraception = false`, pero "tomo la
  píldora y sigo mi ciclo para evitar" es de los casos más comunes del pilar evitar. El
  esquema lo permite (el CHECK solo excluye TTC+hormonal); el flujo lo pisa.

→ v3 hace NULLables los campos de ciclo en embarazo y modela la anticoncepción por
método (sección 5.1); plan 00, ajustes A1+A3.

### A3 · Cifrado en reposo: la brecha más grande entre promesa y realidad — **Alta**

La base SQLite vive **en texto plano**. El threat model real de una app de datos íntimos
incluye pareja con acceso al teléfono, padres, teléfono robado, backups del sistema. Un
bloqueo de app (biometría) protege la UI, **no los datos en disco**; presentar el lock
como protección de datos sería deshonesto.

**Decisión propuesta (plan 15):** `expo-sqlite` trae soporte SQLCipher vía config plugin
(`"useSQLCipher": true`); la clave se genera en el primer arranque y se guarda en el
Keychain/Keystore con `expo-secure-store`. Al no haber usuarias no hay base que migrar:
entra junto con la regeneración v3, antes de cualquier release. La alternativa (cifrar
campos en capa de app) se descarta: más frágil, rompe índices y consultas.

### A4 · "Cero red" es una promesa sin mecanismo — **Media**

El compromiso "cero permisos de red" descansa hoy en que nadie ha añadido código de red.
Para que sea verificable: manifest de Android **sin** `android.permission.INTERNET` en
release (dev necesita Metro), `NSAppTransportSecurity` sin excepciones en iOS, y un
check de CI que haga `expo prebuild` y grepee el manifest, más lista blanca de
dependencias. → Plan 15.

### A5 · La "predicción honesta" no se puede medir — **Alta**

El pilar exige poder responder "predije que tu regla llegaría el día X, llegó el día Y,
error Z días". `cycle_predictions` no lo soporta: es un snapshot del último cálculo y la
predicción emitida para un ciclo se sobreescribe antes de poder compararla con la
realidad. Sin estructura emitida-vs-real, cualquier widget de "precisión de REA" nacería
sin datos que lo respalden.

**Decisión propuesta:** tabla `cycle_records` (sección 5.2), una fila por ciclo cerrado,
con la predicción vigente cuando el ciclo abrió y su error en días. Además evita
re-derivar ciclos desde `period_runs` en cada estadística.

### A6 · El test de embarazo necesita capturarse en todos los modos de ciclo — **Media**

La tentación natural es exponer `pregnancy_test_result` solo en el paso de fertilidad
del modo TTC. Pero una usuaria en modo **evitar** (un pilar completo) también puede
tener un positivo, y es quien más necesita un camino cuidadoso — para ella puede no ser
una buena noticia. → Plan 02: el test se captura en todos los modos de ciclo, con copy
neutro (sin celebración); plan 10: la transición a embarazo se dispara desde cualquier
modo.

## 4. Decisiones de modelado abiertas (diseñar bien antes de poblar)

Estas tablas están vacías; no hay filas incorrectas que reparar. Son decisiones que
conviene cerrar en v3 para no poblarlas mal.

| #   | Tabla / columna                        | Decisión                                                                                                                                                   | Severidad |
| --- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| M1  | `symptom_catalog.applicable_mode`      | Valor único: no puede expresar "TTC **y** embarazo" (náuseas). → `applicable_modes` CSV, filtro en memoria (catálogo ~40 filas)                            | Media     |
| M2  | `content_items.target_mode`            | Mismo problema que M1 (contenido válido para TTC y embarazo a la vez). → `target_modes` CSV                                                                | Media     |
| M3  | `content_items.locale`                 | Contradice el enfoque de claves i18n (`title_key`/`body_key` → `lang/`). → eliminar; el idioma lo resuelve i18next                                         | Media     |
| M4  | `daily_summary`                        | Sin `cycle_day` ni `checkin_count`; estadísticas y calendario los recalcularían en cada lectura. → añadir ambos                                            | Media     |
| M5  | `cycle_predictions`                    | No guarda ventana fértil ni duración de periodo predichas; la regla −5/+1 se duplicaría por superficie. → añadir bordes y longitud                         | Baja      |
| M6  | `medication_catalog.is_pregnancy_safe` | Binario con default "insegura"; `0` real significa "no verificada" y alarmaría en cada embarazo. → `pregnancy_safety` (`unknown`/`safe`/`caution`)         | Media     |
| M7  | `intercourse_log.in_fertile_window`    | Marcador calculado y persistido: caduca con cada recálculo. → eliminar; se deriva con JOIN a `daily_summary.is_fertile_day`                                | Media     |
| M8  | `app_settings`                         | Sin flags de privacidad ni preferencias por tipo de notificación. → sección 5.3                                                                            | Media     |
| M9  | Seeder de síntomas                     | 0 síntomas de embarazo; `label_key` apunta al namespace `checkIn:` que no existe en `lang/`. → ampliar seed + crear `lang/{es,en}/check-in.json` (plan 02) | Media     |

### 4.1 Cobertura de señales: lo que faltaba preguntar

Qué información necesita el producto final que el esquema aún no puede guardar. Cada
señal nueva cumple el contrato señal → valor; las que no lo cumplen se rechazan.

| Señal nueva                               | Dónde                         | Qué produce                                                                                                    |
| ----------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Método anticonceptivo** (no solo sí/no) | `reproductive_intent_history` | Predicción honesta por método: hormonal suprime ventana fértil; DIU de cobre no; el patrón de sangrado difiere |
| **Libido** (1-5)                          | `checkins`                    | Curva por fase (pico folicular tardío típico); señal esperada en apps de ciclo                                 |
| **Calidad de sueño** (1-5)                | `checkins`                    | Correlación sueño-fase; complementa energía/ánimo en las curvas                                                |
| **Peso** (kg, opcional)                   | `checkins`                    | Seguimiento suave en embarazo (jamás juicio); retención por fase en ciclo                                      |
| **Hora de la temperatura basal**          | `checkins`                    | La BBT solo vale al despertar; permite descartar tomas tardías como outliers                                   |
| **Lactancia** (posparto)                  | `reproductive_intent_history` | Suprime/degrada predicciones (amenorrea de lactancia); sin ella el posparto predice mal                        |
| **Base de datación del embarazo**         | `pregnancy_episodes`          | Procedencia honesta de la semana: FUM declarada, FPP (dada por su médica) o ecografía                          |
| **Contenido guardado** (`saved_at`)       | `content_delivery_log`        | Favoritos: la usuaria vuelve a lo que le sirvió; señal de qué contenido funciona                               |

Rechazadas por ahora (sin valor claro, o v2 con criterio de entrada): síntomas
personalizados (catálogo fijo hasta que se quede corto en uso real), horas de sueño
numéricas (calidad 1-5 basta), método de protección por acto (`protected` binario
basta), ánimo multi-etiqueta (escala 1-5 basta).

## 5. Esquema v3 — regeneración del maestro

Sin migración: se regenera `schema.sql` (y espejo Drizzle, enums y tests por tabla),
`DATABASE_VERSION = 3`, y el reset de `initializeDatabase` hace el resto en dev. El
runner de migraciones queda **fuera** hasta el primer release.

### 5.1 Cambios por tabla

```sql
-- reproductive_intent_history (A2)
--   regularity, declared_cycle_length, declared_period_length → NULLables
--   CHECK: pregnancy_tracking ⇒ los tres NULL; modos de ciclo ⇒ los tres NOT NULL
--   hormonal_contraception (boolean) → contraception_method TEXT NULL CHECK IN
--     ('none','pill','hormonal_iud','copper_iud','implant','injection',
--      'ring','patch','barrier','other')          -- NULL = prefirió no decir
--   CHECK: tracking_ttc ⇒ method NOT IN (métodos hormonales)
--   + breastfeeding INTEGER NULL CHECK (0,1)      -- solo filas posparto
--   ("hormonal" se deriva en dominio: pill/hormonal_iud/implant/injection/ring/patch)

-- symptom_catalog (M1):  applicable_mode → applicable_modes TEXT NOT NULL DEFAULT 'all' (CSV)

-- content_items (M2, M3): target_mode → target_modes CSV; eliminar locale

-- content_delivery_log:  + saved_at TEXT NULL (guardados); surface CHECK amplía a
--                        ('today','day_detail','statistics','learn','pregnancy')

-- daily_summary (M4):    + cycle_day INTEGER NULL, + checkin_count INTEGER NOT NULL DEFAULT 0

-- cycle_predictions (M5): + predicted_fertile_start TEXT, + predicted_fertile_end TEXT,
--                         + predicted_period_length INTEGER

-- medication_catalog (M6): is_pregnancy_safe → pregnancy_safety TEXT NOT NULL
--                          CHECK IN ('unknown','safe','caution') DEFAULT 'unknown'

-- intercourse_log (M7):  eliminar in_fertile_window

-- pregnancy_episodes:    + dating_basis TEXT NOT NULL DEFAULT 'lmp'
--                          CHECK IN ('lmp','due_date','ultrasound')

-- checkins (4.1):        + weight_kg REAL CHECK (30.0–250.0)
--                        + libido INTEGER CHECK (1–5)
--                        + sleep_quality INTEGER CHECK (1–5)
--                        + basal_body_temp_time TEXT CHECK GLOB 'HH:MM'
```

### 5.2 Nueva tabla `cycle_records` (A5)

Read model del motor: una fila por ciclo **cerrado** (de inicio de regla a inicio de la
siguiente). La escribe el motor al confirmarse el inicio siguiente; nunca la UI.

```sql
CREATE TABLE cycle_records (
    id                    TEXT PRIMARY KEY NOT NULL, -- UUIDv7
    user_id               TEXT NOT NULL,
    start_date            TEXT NOT NULL,
    end_date              TEXT NOT NULL,             -- día anterior al siguiente inicio
    cycle_length          INTEGER NOT NULL,
    period_length         INTEGER,
    ovulation_date        TEXT,
    ovulation_basis       TEXT CHECK (ovulation_basis IN ('bbt','opk','mucus','calendar') OR ovulation_basis IS NULL),
    luteal_length         INTEGER,
    predicted_start       TEXT,     -- predicción vigente cuando el ciclo real empezó
    prediction_error_days INTEGER,  -- inicio real − predicho (negativo = llegó antes)
    is_valid              INTEGER NOT NULL DEFAULT 1 CHECK (is_valid IN (0,1)), -- 15–90 días y no excluido
    excluded_reason       TEXT,
    created_at            TEXT NOT NULL,
    updated_at            TEXT NOT NULL,
    version               INTEGER NOT NULL DEFAULT 1,
    UNIQUE (user_id, start_date),
    FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
) STRICT;
```

Con esto: las estadísticas leen ciclos sin re-derivarlos, la ventana del motor (últimos
6 válidos) es un SELECT, y "precisión de REA" es `AVG(ABS(prediction_error_days))`.

### 5.3 `app_settings` ampliada

```sql
-- Privacidad (A3/A4 se refuerzan en build; esto es preferencia de UX)
+ app_lock_enabled        INTEGER NOT NULL DEFAULT 0
+ discreet_notifications  INTEGER NOT NULL DEFAULT 1  -- lockscreen nunca revela contenido
+ discreet_calendar       INTEGER NOT NULL DEFAULT 0  -- puntos sin etiquetas al mostrar pantalla
+ last_backup_at          TEXT                        -- nudge de respaldo (plan 14)

-- Toggle por tipo de notificación (plan 12; el master es reminders_enabled)
+ notify_daily_checkin    INTEGER NOT NULL DEFAULT 1
+ notify_period_upcoming  INTEGER NOT NULL DEFAULT 1
+ notify_period_late      INTEGER NOT NULL DEFAULT 1
+ notify_fertile_window   INTEGER NOT NULL DEFAULT 1
+ notify_bbt_morning      INTEGER NOT NULL DEFAULT 0
+ notify_pregnancy_week   INTEGER NOT NULL DEFAULT 1
```

## 6. Código

| #   | Hallazgo                                                         | Veredicto                                                                                                                                                                                                                           |
| --- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C1  | `HomeScreen` con selector de fase temporal y namespace `preview` | Esperado; marcado TEMPORAL en el propio código (`HomeScreen.tsx:20-23`). Muere con el plan 04                                                                                                                                       |
| C2  | `src/modules/notifications/` y `test/unit/notifications/` vacíos | Borrar; renacen con el plan 12                                                                                                                                                                                                      |
| C3  | Sin capa de datos más allá del onboarding                        | Esperado; cada plan la introduce (`queries/`/`mutations/` + read hooks `useLiveQuery`). Vigilar que ninguna pantalla lea `db` directo                                                                                               |
| C4  | El motor de ciclo no tiene casa                                  | Los estándares prohíben imports entre features y el motor es dominio compartido. → nueva capa `src/domain/` (dominio puro + proyectores; importa `db/` y `shared/`). Única extensión estructural; se añade a la skill de estructura |

## 7. Documentación

| #   | Documento                                    | Veredicto                                                                                                                                                                                                                                       |
| --- | -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | `DESIGN.md:7-8`                              | Referencia un mockup renombrado; la ruta real es `docs/design-system/screens/onboarding.html`. Corregir — un minuto                                                                                                                             |
| D2  | `src/features/onboarding/README.md`          | Describe dirección visual y componentes que ya no existen. **Congelar, no perseguir**: cartel "⚠️ desactualizado; se reescribe al retocar el feature". Mantener READMEs de features al día mientras las rutas pueden cambiar es trabajo quemado |
| D3  | Skill `standards-rea-code-structure`         | Promete drizzle-kit, `store/` global y MMKV que el repo no usa. Alinear cuando se toque la skill (añadiendo además `src/domain/`)                                                                                                               |
| D4  | `docs/design-system/screens/onboarding.html` | Revisión visual rápida de que refleja la versión final del onboarding                                                                                                                                                                           |

## 8. Qué NO hacer ahora

Anti-sobre-ingeniería explícita, con criterio de entrada para cada cosa:

- **Runner de migraciones** — cuando exista la primera instalación que no se pueda
  resetear (primer release).
- **Cifrado con passphrase de usuaria para el backup** — cuando usuarias reales lo
  pidan; la exportación sale descifrada con aviso claro.
- **Síntomas personalizados** — cuando el catálogo fijo se quede corto en uso real.
- **Sync / cuentas / nube** — nunca, salvo redefinición del producto.
- **Merge de backups** — el restore es reemplazo total.
- **Perseguir READMEs de features no construidos** — congelar con cartel (D2).

## 9. Prioridades

Orden de ejecución recomendado:

1. **A3** — implantar cifrado en reposo y ajustar el README para que diga la verdad
   exacta de qué protege cada cosa (plan 15).
2. **Regenerar el maestro a v3** — secciones 5.1-5.3 completas, de una vez: es la última
   ventana barata para romper el esquema.
3. **A5** — `cycle_records` entra en v3; el motor la escribe desde el plan 01.
4. **A2 completo** — ajustes A1+A3 del plan 00 sobre el esquema nuevo.
5. **Pilar embarazo presente desde M3** — hero de semana + corpus mínimo de contenido
   semanal (planes 09 y 11, fase 1).
6. **A4 + A6** — check de cero-red en CI; test de embarazo en todos los modos.
7. **M9** — síntomas de embarazo + `applicable_modes` pobladas (tras v3, para no
   re-trabajar el seeder).
