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

3. **App instalada** en el emulador:
   ```bash
   npm run android
   ```
   La primera compilación es larga (Gradle + deps nativos). Las siguientes son
   incrementales.

## Cómo correr

Desde la raíz del repo:

```bash
# Un feature completo.
npm run e2e:diario        # onboarding | diario | checkin

# Un flow concreto.
npm run e2e:flow -- maestro/flows/diario/02-diario-detalle.yaml

# Todo.
npm run e2e
```

Los screenshots caen en `maestro/screenshots/captures_<DD_MM_YY_HH_MM_SS>/`
(gitignored). Cada corrida crea una carpeta nueva con timestamp. **Antes de
una nueva corrida borra las carpetas `captures_*` viejas** para que no se
acumulen (están fuera de git pero ocupan disco):

```bash
rm -rf maestro/screenshots/captures_*
```

## Estructura

```
maestro/
  config.yaml                          # appId (android.package)
  README.md                            # este archivo
  flows/
    onboarding/
      00-abrir-app-limpia.yaml         # helper: clearState + launch
      01-onboarding-completo.yaml      # welcome → complete → tabs
    diario/
      00-app-onboarded.yaml            # helper: deja app lista en /(tabs)
      01-diario-lista.yaml             # tab Diario + navegación meses
      02-diario-detalle.yaml           # detalle + toggle exclusión
    checkin/
      01-checkin-completo.yaml         # wizard completo hasta guardar
```

## Convenciones

- **Naming:** `NN-descripción.yaml` (cero-padding para orden estable). Los
  helpers arrancan en `00-`.
- **Selectores:** priorizar `id` (testID) sobre texto. El texto depende del
  idioma del dispositivo y se rompe al traducir.
- **Helpers:** reusar con `- runFlow: ./ruta/al/helper.yaml`. Mantienen setup
  fuera de los flows de negocio.
- **Idioma de pasos:** nombres visibles del flow (título + descripción) en
  español, igual que los tests Jest.
- **Screenshots:** `takeScreenshot: <nombre>` genera PNG con ese nombre en
  `maestro/screenshots/captures_<timestamp>/` (creada por `--debug-output`).
  Un screenshot por estado relevante. Las capturas **no se versionan** en git
  (ver `.gitignore`); bórralas antes de una nueva corrida para evitar acumular.

## testID necesarios

Maestro selecciona elementos por `testID`. Convención de prefijos por feature:

| Prefijo       | Feature       | Ejemplo                    |
|---------------|---------------|----------------------------|
| `onboarding-` | Onboarding    | `onboarding-cta-primary`   |
| `tab-`        | Tab bar       | `tab-home`, `tab-diary`    |
| `diary-`      | Diario        | `diary-day-*`, `diary-month-prev` |
| `checkin-`    | Check-in      | `checkin-start`, `checkin-next`, `checkin-save` |

Antes de añadir un flow nuevo, verifica que los selectores existan en el
componente (`grep testID src/`). Si faltan, añádelos — es preferible tocar el
componente con un testID estable antes que seleccionar por texto traducido.

## Añadir un flow nuevo

1. Decide el feature y crea `maestro/flows/<feature>/NN-descripción.yaml`.
2. Si necesitas estado previo (app limpia, onboarding hecho), reusa un helper
   con `runFlow`.
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

## Limitación conocida: `inputText` con TextInput de React Native

En emuladores Android recientes (API 36) el comando `inputText` de Maestro NO
escribe en `TextInput` controlados de React Native: el campo recibe foco pero
`onChangeText` no dispara y el store no se actualiza. Bloquea flows que
requieran tipear (onboarding `profile`, edición de notas, etc.).

Flujos afectados: `onboarding/01-onboarding-completo.yaml` se cae en el paso
Profile. Los flujos de Diario y Checkin dependen de haber completado onboarding,
así que también quedan pendientes hasta resolver esto.

Workarounds pendientes de evaluar:

- `adb shell input text` via `runScript` con un archivo JS puente.
- Modo "test seed" en la app: deep link `rea://test-seed` que pre-cargue datos
  vía Drizzle, saltando onboarding y dejando checkins/listos para validar.
- Build de release con TextInput nativo sin controlar (poco práctico).

Lo que **sí** se puede validar hoy con los flows existentes:

- Welcome screen (primer paso del onboarding).
- Pantallas que carguen con datos preexistentes (si se siembra la DB manualmente).
- Navegación, tab bar, y cualquier interacción que no requiera escribir texto.
