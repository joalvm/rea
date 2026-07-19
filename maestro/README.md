# Maestro — Verificación visual de Rea

Maestro es el framework E2E que usamos para **verificar visualmente** la app
renderizada en un emulador Android. No es una suite de regresión continua.

## Cuándo usarlo

- Cuando un cambio toca **diseño, colores, interacción o navegación** de un
  feature.
- Cuando se quiere validar que una pantalla calza con su mockup HTML en
  `docs/design-system/screens/`.
- **No** en cada commit. Los tests Jest (unit + integration) siguen siendo la
  red de regresión automática.

## Requisitos

1. **Maestro CLI** instalado (una sola vez):

    ```bash
    curl -Ls "https://get.maestro.mobile.dev" | bash
    ```

    Deja el binario en `~/.maestro/bin/maestro`. Asegúrate de tenerlo en `PATH`
    (o invoca con la ruta completa).

2. **Emulador Android** corriendo (AVD). Rea está probado contra API 36.

3. **App instalada** en el emulador. Para Maestro, preferir release embebido:
    ```bash
    npm run android:e2e
    ```
    La primera compilación es larga (Gradle + deps nativos). Las siguientes son
    incrementales. `npm run android` queda para desarrollo interactivo.

4. **JavaScript servido en modo producción local** para evitar la penalización
   de desarrollo de Expo durante Maestro cuando se usa una build de desarrollo:
    ```bash
    npm run start:e2e
    ```
    Mantén ese proceso activo mientras corres los flows. Expo documenta
    `--no-dev --minify` como la forma local de probar el rendimiento del bundle
    de producción.

## Configuración y cómo correr

`maestro/config.yaml` centraliza descubrimiento, tags de helpers y política de
ejecución. Maestro 2.6.1 exige `appId` en cada flow al parsear el workspace;
mantener ese valor sincronizado con `app.json`.

Desde la raíz del repo:

```bash
# Todo. Helpers quedan excluidos automáticamente.
npm run e2e

# Un feature completo.
npm run e2e:onboarding
npm run e2e:diario
npm run e2e:checkin
npm run e2e:calendar

# Con el emulador configurado previamente en modo oscuro y fuente grande.
npm run e2e:visual

# Un flow concreto.
npm run e2e:flow -- maestro/flows/diario/02-diario-detalle.yaml
```

`npm run e2e` es deliberadamente serial: ejecuta onboarding, diario y check-in
uno después de otro sobre el mismo AVD. Maestro 2.6.1 puede descubrir varios
flows de un workspace sin respetar el orden esperado en una sesión local; la
serialización evita que los helpers compitan por la misma SQLite. Para un AVD
único, usa estos scripts como entrada oficial.

Los scripts escriben screenshots y reportes en `.maestro/tests/`; el debug de un
flow concreto queda en `.maestro/debug/`. Todo está ignorado por Git.

## Sembrado de datos de demo (`__DEV__`)

Para validar pantallas que requieren datos (diario, detalle, checkin) sin
conducir todo el onboarding a mano, existe una ruta de desarrollo que siembra
datos de demo:

- **Ruta:** `/dev/seed` (solo en builds `__DEV__`, nunca en producción).
- **Entrada:** botón "Sembrar datos demo" en la pantalla de bienvenida del
  onboarding (`testID="dev-seed-trigger"`).
- **Qué hace:** restablece la DB y crea un perfil con onboarding cerrado, un
  periodo en curso y varios check-ins en los últimos días (con síntomas, notas
  y sangrado). Tras sembrar redirige a `/(tabs)`.
- **Implementación:** `src/modules/dev/seedDemoData.ts` + `DevSeedScreen.tsx`.

Los flows de diario/checkin reusan esto vía el helper
`maestro/flows/dev/00-seed.yaml`.

## Estructura

```
maestro/
  config.yaml                          # descubrimiento, tags y orden de suite
  README.md                            # este archivo
  flows/
    onboarding/
      00-abrir-app-limpia.yaml         # helper: clearState + launch
      01-onboarding-completo.yaml      # welcome → complete → tabs
    dev/
      00-seed.yaml                     # helper: siembra datos demo y aterriza en /(tabs)
    diario/
      00-app-onboarded.yaml            # helper: siembra y deja app lista en /(tabs)
      01-diario-lista.yaml             # tab Diario + navegación meses
      02-diario-detalle.yaml           # detalle + toggle exclusión
    checkin/
      01-checkin-completo.yaml         # wizard completo hasta guardar
```

Los archivos `00-*` tienen tag `helper`: no son casos independientes y solo se
ejecutan mediante `runFlow`. Los casos de negocio tienen tags de feature,
`journey` y `visual`.

### Estado de los flows

| Flow                                | Tipo    | Contrato protegido                |
| ----------------------------------- | ------- | --------------------------------- |
| `onboarding/00-abrir-app-limpia`    | helper  | Instalación nueva y primer paso   |
| `onboarding/01-onboarding-completo` | journey | Welcome → onboarding → tabs       |
| `dev/00-seed`                       | helper  | Datos demo deterministas          |
| `diario/00-app-onboarded`           | helper  | Estado autenticado con datos demo |
| `diario/01-diario-lista`            | journey | Lista y navegación mensual        |
| `diario/02-diario-detalle`          | journey | Detalle y exclusión reversible    |
| `checkin/01-checkin-completo`       | journey | Home → wizard → persistencia      |
| `calendar/01-calendario-mensual`    | journey | Tab calendario + navegación mensual |
| `visual/01-apariencia-y-texto-grande` | visual | Onboarding en modo oscuro / fuente grande |

## Convenciones

- **Naming:** `NN-descripción.yaml` (cero-padding para orden estable). Los
  helpers arrancan en `00-`.
- **Metadata:** cada flow declara `appId`, `name` en español y tags explícitos.
  Si cambia el package Android, actualizar `app.json` y todos los flows.
- **Selectores:** priorizar `id` (testID) sobre texto. El texto depende del
  idioma del dispositivo y se rompe al traducir.
- **Helpers:** reusar con `- runFlow: ./ruta/al/helper.yaml`. Mantienen setup
  fuera de los flows de negocio.
- **Idioma de pasos:** nombres visibles del flow (título + descripción) en
  español, igual que los tests Jest.
- **Screenshots:** `takeScreenshot: <nombre>` genera PNG en
  `.maestro/tests/screenshots/` (creada por defecto por `maestro test`).
  Un screenshot por estado relevante. Las capturas **no se versionan** en git
  (ver `.gitignore`).

## testID necesarios

Maestro selecciona elementos por `testID`. Convención de prefijos por feature:

| Prefijo       | Feature    | Ejemplo                                             |
| ------------- | ---------- | --------------------------------------------------- |
| `onboarding-` | Onboarding | `onboarding-cta-primary`, `onboarding-profile-name` |
| `tab-`        | Tab bar    | `tab-home`, `tab-diary`                             |
| `diary-`      | Diario     | `diary-day-*`, `diary-month-prev`                   |
| `checkin-`    | Check-in   | `checkin-start`, `checkin-next`, `checkin-save`     |
| `dev-`        | Desarrollo | `dev-seed-trigger`                                  |

Antes de añadir un flow nuevo, verifica que los selectores existan en el
componente (`rg 'testID=' src/`). Si faltan, añádelos en el componente dueño y
usa prefijo del feature. `testID` debe describir contrato estable, no texto de
UI ni posición visual.

## Añadir un flow nuevo

1. Decide el feature y crea `maestro/flows/<feature>/NN-descripción.yaml`.
2. Si necesitas estado previo (app limpia, onboarding hecho, datos sembrados),
   reusa un helper con `runFlow`.
3. Usa `id:` para todos los taps. Si el `testID` no existe, añádelo al
   componente.
4. Termina con `takeScreenshot: <nombre-descriptivo>` para cada estado
   relevante.
5. Documenta el propósito del flow en un comentario al inicio del archivo.

## Límites

- Maestro corre sobre Android nativo. iOS requiere macOS (no cubierto aquí).
- La primera corrida real puede pedir ajustes finos (timing, selectores que no
  matchean exactamente). Es normal iterar.
- Si el emulador no está corriendo, los flows fallan al lanzar la app.

## Entrada de texto

`inputText` se usa en onboarding para comprobar el contrato real de `TextInput`:
el CTA inicia disabled y queda enabled después de `onChangeText`. La app debe
probarse con la variante release (`npm run android:e2e`); en la build debug de
Expo, Maestro sobre Android puede esperar varios segundos por carácter mientras
la jerarquía se estabiliza, lo que infla artificialmente el journey visual.

El helper `dev/00-seed.yaml` existe por otra razón: preparar datos persistidos
para diario y check-in sin pagar el costo de conducir onboarding en cada flow.

## Emulador Android con consumo bajo

Diagnosticar dispositivo conectado:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/optimize-maestro-emulator.ps1
```

Aplicar ajustes seguros para E2E (sin tocar resolución ni densidad):

```powershell
powershell -ExecutionPolicy Bypass -File scripts/optimize-maestro-emulator.ps1 -Apply
```

El script desactiva animaciones del sistema y evita suspensión durante la
corrida. Para una sesión nueva, usar aceleración WHPX y GPU del host:

```powershell
adb emu kill
emulator @Mensu_API_36 -gpu host -no-audio -no-boot-anim -no-snapshot-load -no-snapshot-save -cores 2 -memory 2048
```

`-gpu host` usa la aceleración disponible; `-no-audio` y `-no-boot-anim` quitan
procesos y trabajo visual innecesarios. Los flags de snapshot hacen el estado
más reproducible y evitan mantener una imagen restaurada en memoria, a cambio
de un arranque en frío más lento. `-cores 2 -memory 2048` limita explícitamente
la sesión de Maestro; si el proyecto necesita depurar otra carga, se puede
subir solo ese par de valores. No usar `--shards` ni varios AVD para estos
flows: cada caso limpia o siembra la misma SQLite local y un solo emulador da
señal suficiente. Mantener resolución 1080×2400 para que screenshots sigan
comparables. Si `-gpu host` no arranca, usar `-gpu swiftshader_indirect` como
fallback, con mayor consumo de CPU.
