# DESIGN.md

Fuente de verdad para las decisiones visuales y de interacción de Rea. El sistema tiene tres capas con una jerarquía
explícita; no compiten entre sí.

1. `DESIGN.md` define intención, contratos y reglas de uso.
2. `src/theme/*` y `src/components/*` son la implementación ejecutable de esos contratos. Si difieren en un valor
   concreto, gana el token de código y se corrige este documento en el mismo cambio.
3. `docs/design-system/` documenta y valida visualmente el sistema. Nunca introduce tokens, componentes o pantallas nuevos.

## 0. Gobernanza del sistema

- Una pantalla HTML canónica usa `styles/global.css`, su CSS de área en `styles/pages/`, `scripts/site.js` y, cuando
  corresponde, su script de área en `scripts/pages/`. No incluye estilos ni scripts inline, ni colores, sombras o
  tipografías nuevos.
- Un mockup que no cumple esa regla es exploratorio: no se usa para construir producto ni para aprobar UI. Los mockups
  legacy se revisan o se retiran antes de reutilizarlos.
- El trabajo parte de un contrato existente: token → componente compartido → screen. Un screen no crea una variante
  visual por conveniencia.
- Antes de añadir UI se comprueba `docs/design-system/governance/index.html`, se actualiza el contrato correspondiente y se
  ejecuta `npm run design:audit` junto con typecheck/lint.
- Cada ficha de `docs/design-system/screens/` declara si la screen es canónica, está en integración o sigue por
  construir. Un stub no puede pasar a referencia canónica por tener un mock bonito.
- Cada componente interactivo define: reposo, pressed, selected cuando aplique, disabled, error/feedback y semántica
  accesible. Las pantallas de producto no dependen de color solo para comunicar estado.

> **Dirección actual: “Rea Soft”** (jun 2026). Suave, aireada y luminosa. Reemplaza por completo la
> dirección anterior “outlined seria” (botones huecos, bordes gruesos, cero sombra, cero ilustración).
> No queda nada de aquello. Lo único intacto es el celeste de marca **#7CD9F9**.

## 1. Principios

- **Mobile-first 375px**: alcance actual = teléfono vertical. Controles al alcance del pulgar, touch target mínimo
  `sizing.minTouch` (44pt); controles Android nuevos apuntan a 48dp. iPad se habilita solo con layout por size class y
  evidencia de multitarea.
- **Suave y luminosa**: blancos amplios, formas redondeadas, color que respira. La calma comunica “local-first”.
- **Privacidad visible**: superficies limpias, avisos sin ruido.
- **Predicción honesta**: se distingue observado, estimado y baja confianza; nunca diagnóstico.
- **Color con tarea**: el celeste identifica la marca y la acción; las fases dan contexto; los estados dan feedback.
- **Un CTA primario por vista**, anclado abajo.
- **Voz**: trato de “tú”, frases breves, sin alarmar, con tildes correctas.
- **Nativo antes que decorativo**: navegación de plataforma, safe areas, Back predictivo y targets de 44/48pt no se
  sacrifican por un mockup.

## 2. Decisiones de diseño

### 2.1 Superficies y profundidad — sombra-susurro

- Las sombras existen, pero son un **susurro** (`theme.shadows[1]` para tarjetas, `[2]` para CTA/hojas). Nunca un
  drama de profundidad. La jerarquía se apoya en **superficie + borde fino + ritmo**; la sombra solo redondea.
- Una tarjeta = superficie (`surface`) + borde `thin` (`border`) + `shadows[1]`. Cero cards flotantes pesadas.

### 2.2 Bordes — finos

- Borde por defecto = `borderWidth.thin`, color `border`. El borde define forma; no se usa para gritar.
- Estado seleccionado → el borde sube a `thick` (2px) color `primary`. **Sin halo / focus ring** (estilo shadcn): el
  estado se lee en color + grosor, nunca con un anillo difuso.
- Radios generosos: `radius.lg` (16) inputs/wheels, `radius.xl` (20) tarjetas, `radius.pill` para CTAs y segmented.

### 2.3 Botones — relleno sólido

- **CTA primario = relleno celeste sólido**: `backgroundColor: primary`, texto `onPrimary` (navy profundo), sin borde,
  pill, con sombra-susurro tintada de marca. Pressed → `opacity state.pressedOpacity` + `scale state.pressedScale`.
  `accent` opcional sustituye el relleno (p. ej. fase embarazo).
- **CTA secundario = ghost/text**: sin relleno, texto `textMuted` en Quicksand.
- `min-height` `controlLg` (56). Anclado abajo, ancho full.

### 2.4 Progreso — puntos tipo carrusel

- **No hay barra de progreso ni contador “x / n”** (se sentía formulario). El avance se muestra con **puntos
  flotando sobre el CTA** (`StepDots`): el paso actual es una píldora celeste alargada; el resto, puntos suaves.
- Cabecera = solo un chevron de volver (círculo `surface` + borde `thin`), arriba a la izquierda. Nada a la derecha.

### 2.5 Inputs y controles — custom, estilo Material, nunca nativos

- Prohibidos `<input type="number">`, `<input type="date">` nativos y checkboxes genéricos.
- **Texto libre** → `OutlinedField`: borde sólido (~2px), reposo `border`, foco `primaryPressed`. **Sin ring.**
- **Numérico / fecha / hora** → `WheelPicker` (columna scrolleable, bare) dentro de un **`WheelGroup`**: un único marco
  casi-blanco de borde fino con **una sola banda de selección** centrada. Día/mes/año y hora-inicio/fin se leen como
  **un control cohesivo**, no como ruedas sueltas separadas.
- **Selección binaria / pequeña** → `SegmentedControl` (pill sobre tinte celeste; activo = superficie blanca con
  sombra-susurro, texto `link`; sin bordes).
- **Tarjeta de opción** → `SelectableCard` (superficie + borde fino + `shadows[1]`; activa = borde `thick` `primary` +
  `primarySubtle` + check; ícono en burbuja `primaryTint` → `primary` al activarse).
- **Booleano on/off** → `Switch` / `ToggleRow` (52×32, on = `primary`).
- **Valor ±1** → `Stepper` compacto sin contenedor: botones cuadrados de tinte celeste (`primaryTint`) − valor +.

### 2.6 Ilustración

- **Bisagras (bienvenida / cierre)** → `ReaIllustration`: protagonista faceless de medio cuerpo (cabello violeta =
  identidad constante) sobre un blob de luz celeste con un orbe = “la luz de Rea”. Plana, suave, sin rostro.
- **Pantallas de captura** → `StepBadge`: blob pequeño de `primaryTint` con un ícono de línea (`link`). Da calidez sin
  robar espacio al formulario. Rea onboarding es un flujo de captura, no un carrusel de marketing: una ilustración
  grande por pantalla no aplica.

### 2.7 Tipografía

- Títulos: **Quicksand** (`variant.display/h1/h2/h3`). Cuerpo y UI: **Nunito Sans**.
- Las fuentes estáticas no responden a `fontWeight`: cada variante fija su `fontFamily` al peso concreto.
- Números en datos: tabulares cuando aplique.

### 2.8 Espaciado y ritmo

- Escala 4pt (`space.xs … 6xl`). Padding horizontal de pantalla `space.xl` (20). Lectura `sizing.readableMaxWidth` (360).

### 2.9 Estados

| Estado                 | Tratamiento                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| Selected (card/choice) | borde `thick` `primary` + fondo `primarySubtle` + check                 |
| Pressed                | `opacity state.pressedOpacity` + `scale state.pressedScale`             |
| Disabled               | `opacity state.disabledOpacity` (0.45); CTA → fondo `surfaceSunken`     |
| Error                  | borde `danger`, texto `dangerText` (sin halo)                           |
| Aviso                  | tarjeta de tinte (`warningSurface` / `primarySubtle`) sin borde + ícono |

### 2.9.1 Familia de selección

- `SelectableCard`: una decisión de navegación o configuración en lista. Puede explicar una opción; usa burbuja de
  icono, borde seleccionado y check.
- `ChoiceCard`: escala breve dentro de un check-in. Es densa por intención, se usa solo en grids de 2–3 opciones y
  mantiene el mismo activo `primary` / `onPrimary` que `SelectableCard`.
- `MultiChip`: selección múltiple no excluyente. No sustituye una tarjeta de decisión ni una escala ordinal.
- La diferencia de densidad es semántica, no una licencia para introducir otro estado seleccionado.

### 2.10 Modo oscuro

- Mismo componente, mismo contrato. Solo cambian los tokens (dark theme = overrides sobre light).
- Toda pantalla se revisa en light y dark con el mismo árbol de componentes.

## 3. Arquitectura del onboarding

- Cada pantalla es una **ruta** bajo `(onboarding)/`; navegación con `router.push` / `router.replace`.
- El estado del borrador vive en el **store efímero** (Zustand). Cada pantalla lo lee/escribe directamente.
- El chrome común (chevron, dots, CTA) lo aporta el scaffold **`OnboardingScreen`**; el contenido lo compone cada
  pantalla con los componentes hoja.

| Componente         | Contrato visual                                                                            | Tokens clave                              |
| ------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------- |
| `OnboardingScreen` | scaffold: chevron volver · scroll · footer con `StepDots` sobre el CTA                     | `background`, `surface`, `border`         |
| `StepDots`         | puntos carrusel; activo = píldora celeste alargada                                         | `primary`, `primaryTint`                  |
| `PrimaryButton`    | pill **sólido** celeste, texto navy, 56h, sombra-susurro                                   | `primary`, `onPrimary`                    |
| `ReaIllustration`  | protagonista faceless sobre blob + orbe (bienvenida/cierre)                                | `primaryTint`, `primary`                  |
| `StepBadge`        | blob pequeño + ícono de línea (pantallas de captura)                                       | `primaryTint`, `link`                     |
| `WheelGroup`       | marco casi-blanco de borde fino + una banda de selección compartida                        | `background`, `border`, `primaryPressed`  |
| `WheelPicker`      | columna scrolleable bare (centro bold, laterales con fade)                                 | `link`, `textSecondary`, `placeholder`    |
| `DateWheel`        | `WheelGroup` con 3 `WheelPicker` (día/mes/año) cohesivos                                   | igual                                     |
| `SegmentedControl` | pill sobre tinte; activo = superficie blanca + sombra-susurro                              | `primaryTint`, `background`, `link`       |
| `SelectableCard`   | superficie + borde fino + `shadows[1]`; activa = borde `primary` + `primarySubtle` + check | `primary`, `primarySubtle`, `primaryTint` |
| `Stepper`          | − valor + compacto, botones cuadrados de tinte celeste                                     | `primaryTint`, `link`                     |
| `ToggleRow`        | switch custom 52×32, on = `primary`                                                        | `primary`, `surfaceSunken`                |
| `OutlinedField`    | borde sólido Material; foco = borde `primaryPressed` (sin ring)                            | `border`, `primaryPressed`                |

## 4. Do / Don’t

**Do**

- Relleno celeste sólido como acción principal (texto `onPrimary`).
- Sombras suaves (susurro), borde fino, radios generosos.
- Progreso con puntos carrusel sobre el CTA.
- Inputs con borde sólido y foco de marca, sin ring.
- Wheels agrupados en un solo control cohesivo (`WheelGroup`).
- Light y dark con el mismo componente; tokens de `src/theme`, nunca hex sueltos (salvo constantes de ilustración).

**Don’t**

- Botones huecos / outlined como acción principal.
- Bordes gruesos por todas partes ni cards flotantes pesadas.
- Barra de progreso superior o contador “x / n”.
- Focus ring (halo) estilo shadcn.
- Inputs nativos (`number`, `date`) o checkboxes genéricos.
- Ruedas de fecha como cajas separadas (usa `WheelGroup`).
