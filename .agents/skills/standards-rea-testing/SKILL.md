---
name: standards-rea-testing
description: "Use when designing, writing, or reviewing tests in Rea. Defines test taxonomy, folder placement, naming, setup style, fixtures, doubles, seeders, and decision rules for unit, integration, component, feature, e2e, and database migration tests across TypeScript, React Native, Zustand, SQLite/Drizzle, services, and i18n. Triggers: test, testing, jest, component test, integration test, e2e, store test, zustand, service test, translation test, i18n, schema test, sqlite, migration, fixture, seeder, mock."
---

# Estándar de Testing · Rea

Índice operativo para decidir qué tipo de prueba escribir, dónde ubicarla, cómo nombrarla y qué infraestructura usar. Esta skill define el criterio. La implementación concreta de cada suite se adapta al sujeto real bajo prueba.

## Mantra

Una prueba existe para proteger un contrato observable. El tipo de test lo define el riesgo real, no la comodidad del autor. Primero se elige el límite correcto; después se escribe la mínima prueba capaz de detectar una regresión real.

## Stack y línea base

- Runner base: Jest.
- Runtime React Native en tests de render: `jest-expo` + React Native Testing Library.
- SQLite real para integración de datos: `@libsql/client` en memoria + `drizzle-orm/libsql`.
- Mocks solo en límites externos o cuando el contrato bajo prueba no exige infraestructura real.

## Arquitectura de carpetas

```text
test/
  unit/
    db/
    stores/
    services/
    features/
    i18n/
    shared/
  integration/
    db/
      schema/
      queries/
      seeders/
      utils/
    stores/
    services/
    features/
    i18n/
    ui/
  db-migrations/
  utils/

maestro/                  # E2E con Maestro — ver sección "Pruebas E2E"
  config.yaml
  README.md
  flows/
    <feature>/
```

Reglas:

- `unit/` contiene pruebas puras o con doubles mínimos.
- `integration/` contiene pruebas que combinan módulos reales o runtime real.
- `db-migrations/` contiene solo lifecycle, reset, versionado y contratos de migración.
- Los flujos E2E (Maestro) viven en `maestro/flows/`, **no** en `test/e2e/`.
- `seeders/` se usa solo para persistir datos reales en integración DB.
- `fixtures/` se usa para objetos de entrada, payloads o recursos estáticos no persistidos.
- No crear carpetas vacías. Se crean cuando aparece el primer caso real.

## Convención de nombres

### `describe`

- Siempre en español.
- Nombra al dueño o contrato bajo prueba, no al archivo.
- Usa forma corta y estable.

Buenos ejemplos:

- `describe("Store de sesión", () => {})`
- `describe("Servicio de perfil", () => {})`
- `describe("Integración del schema de contentItem", () => {})`
- `describe("Inicialización de i18n", () => {})`

### `it`

- Siempre en español.
- Describe un comportamiento observable.
- Usa presente, no promesas vagas.
- No repite el sujeto completo del `describe`.

Buenos ejemplos:

- `it("recupera la sesión persistida al iniciar", () => {})`
- `it("rechaza filas huérfanas", async () => {})`
- `it("renderiza el estado vacío cuando no hay registros", () => {})`

Evitar:

- `it("works", ...)`
- `it("should do something", ...)`
- `it("prueba store", ...)`

### Archivo de test

- usa `*.test.ts` o `*.test.tsx`
- el nombre del archivo replica al dueño del contrato
- si el contrato es de DB por schema, el archivo vive en `test/integration/db/schema/`
- si el contrato es de store, service, feature o i18n, el archivo vive en la categoría y ámbito correctos

Ejemplos:

- `profile.test.ts`
- `sessionStore.test.ts`
- `createProfileService.test.ts`
- `WelcomeScreen.test.tsx`

### Forma del caso

- orden recomendado: preparar, ejecutar, verificar
- usar `beforeEach` solo para setup compartido y estable
- un `it` debe cubrir una sola regla principal
- si un caso necesita demasiados datos, extraer builder, fixture o seeder
- si la preparación domina al comportamiento, el test está en la capa incorrecta o le falta infraestructura reusable

## Modelo mental antes de escribir

1. Identifica el sujeto real.
2. Identifica el riesgo que quieres cubrir.
3. Elige la capa mínima que puede demostrar ese contrato.
4. Decide qué debe ser real y qué puede ser doble.
5. Define el input más pequeño que active el comportamiento.
6. Define la salida observable que prueba el contrato.
7. Escribe el `describe` y los `it` en español antes del cuerpo.
8. Ejecuta la validación más estrecha posible antes de ampliar cobertura.

## Taxonomía de pruebas

### Pruebas unitarias

Usa `test/unit/` cuando:

- el sujeto es puro, determinista o fácilmente aislable
- el riesgo está en una transformación, regla o contrato local
- el runtime nativo, la base de datos o el render real no son necesarios

Sujetos típicos:

- utilidades puras
- validadores
- formatters y mappers
- selectores
- helpers de fechas, números, i18n o dominio
- stores Zustand sin persistencia ni IO real
- servicios que solo orquestan datos con collaborators doblados
- estructura de traducciones o helpers puros de fallback
- metadata de schema Drizzle

Ejemplo de helper puro:

```ts
import { describe, expect, it } from "@jest/globals";

import { clamp } from "@/shared/clamp";

describe("Función clamp", () => {
    it("devuelve el valor original cuando cae dentro del rango", () => {
        expect(clamp(3, 1, 5)).toBe(3);
    });

    it("recorta el valor al límite inferior", () => {
        expect(clamp(-1, 1, 5)).toBe(1);
    });
});
```

Ejemplo de store Zustand puro:

```ts
import { describe, expect, it } from "@jest/globals";

import { createSessionStore } from "@/store/session/createSessionStore";

describe("Store de sesión", () => {
    it("marca la sesión como autenticada al guardar el perfil", () => {
        const store = createSessionStore();

        store.getState().setProfile({ id: "profile-1" });

        expect(store.getState().isAuthenticated).toBe(true);
    });
});
```

### Pruebas de integración

Usa `test/integration/` cuando:

- el contrato depende de dos o más módulos reales
- necesitas runtime real de React Native, SQLite, Zustand persistido o i18n inicializado
- el valor está en la interacción entre piezas, no en una función aislada

Subcategorías:

- `integration/db/`: schema, queries, constraints, cascadas, índices, seeders
- `integration/stores/`: persistencia, middleware, stores conectados a DB o servicios
- `integration/services/`: servicios con DB real, store real o adapters reales
- `integration/features/`: hooks, screens o flujos internos de un feature con collaborators reales o doubles mínimos
- `integration/i18n/`: carga, fallback, interpolación, selección de locale
- `integration/ui/`: render e interacción de componentes o screens con runtime real

#### Integración de base de datos

Usa SQLite real y queries reales.

```ts
import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { periodRun } from "@/db/schema/periodRun";
import { seedPeriodRun } from "@test/integration/db/seeders/periodRunSeeder";
import { seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("Integración del schema de periodRun", () => {
    it("inserta y consulta un tramo válido", async () => {
        await seedProfile(context.database);
        const inserted = await seedPeriodRun(context.database);

        const rows = await context.database.db.select().from(periodRun).where(eq(periodRun.id, inserted.id));

        expect(rows).toHaveLength(1);
    });
});
```

#### Integración de servicios

Úsala cuando el servicio dependa de DB, store, i18n o adapters reales.

```ts
import { describe, expect, it } from "@jest/globals";

import { createProfileService } from "@/services/profile/createProfileService";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("Servicio de perfil", () => {
    it("crea el perfil y devuelve su identificador", async () => {
        const service = createProfileService({ db: context.database.db });

        const result = await service.createDefaultProfile();

        expect(result.id).toBeDefined();
    });
});
```

#### Integración de interfaz

Úsala cuando el contrato exista en render, accesibilidad o interacción.

```tsx
import { describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { PeriodCard } from "@/components/PeriodCard";

describe("Tarjeta de periodo", () => {
    it("notifica la selección al tocar la tarjeta", () => {
        const onPress = jest.fn();

        render(<PeriodCard title="Hoy" onPress={onPress} />);

        fireEvent.press(screen.getByText("Hoy"));

        expect(onPress).toHaveBeenCalledTimes(1);
    });
});
```

#### Integración de i18n

Úsala cuando importe la inicialización real, la carga de recursos o el fallback.

```ts
import { describe, expect, it } from "@jest/globals";

import { createI18n } from "@/modules/i18n/createI18n";

describe("Inicialización de i18n", () => {
    it("usa el idioma base cuando la variante regional no define la clave", async () => {
        const i18n = await createI18n({ locale: "es-PE" });

        expect(i18n.t("common.save")).toBe("Guardar");
    });
});
```

### Pruebas de componente y feature

En este repo, un test de componente o screen aislado pertenece a `test/integration/` porque usa runtime real de React Native y librerías de render. No es unitario aunque el componente sea pequeño.

Piensa así:

- componente aislado: contrato de render, accesibilidad, interacción local
- feature test: flujo interno de un screen, hook o conjunto pequeño de componentes
- service test: contrato de orquestación entre DB, store o adapters

Ejemplo de feature test:

```tsx
import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";

import { WelcomeScreen } from "@/features/onboarding/WelcomeScreen";

describe("Flujo de bienvenida del onboarding", () => {
    it("muestra la acción principal al iniciar sin perfil", () => {
        render(<WelcomeScreen />);

        expect(screen.getByText("Comenzar")).toBeTruthy();
    });
});
```

### Migraciones de base de datos

Usa `test/db-migrations/` cuando el riesgo está en inicialización, reset, versionado, orden de PRAGMAs, seguridad del reset o compatibilidad de lifecycle.

```ts
import { describe, expect, it, jest } from "@jest/globals";

import { initializeDatabase } from "@/db/initializeDatabase";

describe("Inicialización de base de datos", () => {
    it("resetea el schema cuando la versión guardada no coincide", async () => {
        const database = {
            execAsync: jest.fn(async () => undefined),
            getFirstAsync: jest.fn(async () => ({ user_version: 0 })),
        };

        await initializeDatabase(database);

        expect(database.execAsync).toHaveBeenCalledWith("PRAGMA journal_mode = WAL;");
    });
});
```

### Pruebas E2E

**Herramienta:** Maestro (YAML declarativo, corre sobre emulador Android). La
carpeta es `maestro/` en la raíz del repo — **no** `test/e2e/`, porque Maestro
vive fuera de Jest y no comparte su runner.

**Filosofía:** verificación visual bajo demanda. Se corre cuando un cambio toca
diseño, colores, interacción o navegación — **no** en cada commit. Los tests
Jest (unit + integration) siguen siendo la red de regresión automática.

Sujetos típicos:

- onboarding completo
- crear registro y verlo reflejado en varias pantallas
- navegación entre features críticas
- validar que una pantalla calza con su mockup HTML

Reglas:

- un flujo E2E debe validar un objetivo de negocio o una verificación visual, no una colección de clicks
- los nombres de flujo (archivo) y los pasos visibles van en español
- prioriza selectores por `testID` (`id:`) sobre texto — el texto depende del idioma del device
- un flujo E2E no reemplaza pruebas unitarias ni de integración; solo protege el camino final
- antes de escribir un flow, verifica que los `testID` necesarios existan; si faltan, añádelos al componente

Convenciones de nombres:

- archivo: `maestro/flows/<feature>/NN-descripción.yaml` (cero-padding para orden estable)
- helpers (setup reutilizable): `maestro/flows/<feature>/00-*.yaml`, se incluyen con `runFlow`
- prefijos de testID por feature: `onboarding-`, `tab-`, `diary-`, `checkin-`

Ejemplos:

- `maestro/flows/onboarding/01-onboarding-completo.yaml`
- `maestro/flows/diario/02-diario-detalle.yaml`

Cómo correr: ver `maestro/README.md`.

## Cómo pensar por sujeto

### Schemas y queries

- metadata del schema: `test/unit/db/schema/`
- constraints, índices, cascadas, FKs, queries reales: `test/integration/db/schema/` o `test/integration/db/queries/`
- reset, versionado, migración: `test/db-migrations/`

### Stores Zustand

- store puro con estado y acciones locales: `test/unit/stores/`
- store con persistencia, middleware o efectos coordinados: `test/integration/stores/`
- store conectado a DB o servicios: `test/integration/stores/`

### Servicios

- si el servicio solo transforma y orquesta collaborators doblados: `test/unit/services/`
- si el valor depende de DB real, store real o adapters reales: `test/integration/services/`

### Features

- hook o helper puro del feature: `test/unit/features/`
- hook con store, i18n, DB o navegación: `test/integration/features/`
- screen o flujo interno renderizado: `test/integration/features/` o `test/integration/ui/`
- viaje completo entre features: `test/e2e/`

### Traducciones e i18n

- helpers puros de keys, fallback o interpolación: `test/unit/i18n/`
- inicialización real, carga de recursos y fallback por locale: `test/integration/i18n/`
- copy crítico visible en journey completo: `test/e2e/`

## Fixtures, builders, doubles y seeders

### Fixtures

- datos estáticos pequeños
- payloads de entrada
- traducciones de ejemplo
- responses o DTOs esperados

### Builders

- cuando el objeto tiene muchas combinaciones válidas
- exponen defaults sanos y overrides mínimos

### Doubles

- `createXDouble()` para collaborators simples
- el doble implementa solo el contrato usado por el sujeto
- evitar mocks gigantes que imitan medio sistema

### Seeders

- solo para integración con datos persistidos
- nombre: `seedEntidad`
- deben devolver la entidad insertada o los valores usados
- deben vivir cerca del ámbito donde se reutilizan

## Reglas duras

- `describe` e `it` siempre en español.
- La prueba valida contrato observable, no detalle incidental.
- Elige la capa mínima que pueda demostrar el riesgo real.
- No uses snapshots como aserción principal.
- No cuentes llamadas internas si puedes verificar estado, salida o efecto observable.
- No mockees SQLite, Drizzle o React Native cuando el contrato dependa de su comportamiento real.
- Usa infraestructura real solo cuando aporte señal; no por reflejo.
- Cada prueba debe poder explicar por qué falló sin leer toda la implementación.

## Antipatrones

- llamar integración a un test que solo mira metadata
- meter varios sujetos sin relación en una misma suite
- duplicar datos verbosos inline en diez archivos distintos
- usar un fixture gigante cuando bastan dos campos
- probar private helpers en vez de contratos públicos
- mezclar aserciones de varias reglas no relacionadas en un mismo `it`
- escribir títulos en inglés o sin verbo observable

## Checklist antes de cerrar

- ¿El sujeto y el riesgo están nombrados con claridad?
- ¿La categoría elegida es la más pequeña que demuestra el contrato?
- ¿El setup es proporcional o está sobreconstruido?
- ¿Los nombres de `describe` e `it` están en español y dicen algo útil?
- ¿Los fixtures, doubles o seeders tienen dueño claro?
- ¿La validación ejecutada es la más estrecha posible para ese cambio?
