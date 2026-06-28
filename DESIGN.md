# DESIGN.md

Fuente de verdad en markdown para las decisiones visuales y de interacción de Rea. Complementa
las otras dos fuentes y NO las reemplaza:

- `docs/design-system/*.html` → referencia visual interactiva (color, tipografía, espacio, componentes, hero, calendario).
- `src/theme/*` → tokens de código (light/dark) que se consumen con `createStyles((theme) => …)`.
- Este `DESIGN.md` → decisiones y contratos de componente, legibles en una sola pasada.

## 1. Principios heredados del design-system

- **Mobile-first 375px**: controles al alcance del pulgar, touch target mínimo `sizing.minTouch` (44pt).
- **Privacidad visible**: superficies limpias, avisos sin ruido; la calma comunica “local-first”.
- **Predicción honesta**: se distingue observado, estimado y baja confianza; nunca se presenta como diagnóstico.
- **Color con tarea**: `aqua` identifica la marca, las fases explican contexto, los estados dan feedback.
- **Un CTA primario por vista**.
- **Voz**: trato de “tú”, frases breves, sin alarmar.

## 2. Decisiones de diseño de Rea

### 2.1 Superficies y profundidad — cero sombras

- **Quedan prohibidas las sombras** (`theme.shadows`). El tema las expone por compatibilidad legacy, pero la
  dirección es deprecarlas y onboarding NO las usa.
- La jerarquía se resuelve con **borde + color + escala + ritmo**, nunca con elevación.
- Separación de superficies con `border` / `divider`, no con `box-shadow`.

### 2.2 Bordes — estilo Outlined (Material 3)

- Borde firme y llamativo: `borderWidth.thick` (2px), color `borderStrong` (mist 300) en reposo.
- Foco / selected → el borde pasa a `primary` o `text`. **Sin outline ring** (sin halo estilo shadcn): el estado se lee
  solo en el color y grosor del borde.
- Radios generosos: `radius.lg` (16) / `radius.xl` (20) / `radius.2xl` (28) para tarjetas; `radius.pill` para pills y CTAs.

### 2.3 Botones — no sólidos

- **CTA primario = outlined bold**: borde `thick` color `link`/`primary`, fondo `transparent` (o `surface`), texto `link`.
  Pressed → fondo `primaryTint`, borde `primaryPressed`.
- **CTA secundario = ghost/text**: sin borde, texto `textMuted`/`link`.
- Nunca un relleno sólido (`backgroundColor: primary`) como acción principal.
- Min-height `controlMd` (48); el CTA principal puede usar 52–56. Anclado abajo, al alcance del pulgar.

### 2.4 Inputs y controles — custom, dinámicos, nunca nativos

- Prohibidos el `<input type="number">`, el `<input type="date">` nativo y los checkboxes genéricos.
- **Numérico** → `WheelPicker` (columna scrolleable). La “profundidad” se logra con un fade por color (máscara
  gradient), no con sombra.
- **Fecha** → `DateWheel` (3 columnas día/mes/año estilo wheel).
- **Selección pequeña / binaria** → `SegmentedControl` (segmento activo = borde bold + surface) o `SelectableCard`.
- **Booleano on/off** → `Switch` custom.
- **Valor ±1** → `Stepper` (− / valor / +) outlined.
- **Texto libre** (p. ej. nombre) → `Field` outlined (borde thick; foco = borde `primary`, sin ring).

### 2.5 Tipografía

- Títulos: **Quicksand** (`typography.variant.display/h1/h2/h3`).
- Cuerpo y UI: **Nunito Sans** (`body/bodyStrong/subhead/footnote/caption/overline`).
- Las fuentes estáticas no responden a `fontWeight`: cada variante fija su `fontFamily` al peso concreto.
- Números en datos: `font-variant-numeric: tabular-nums`.

### 2.6 Espaciado y ritmo

- Escala 4pt (`space.xs … 6xl`). Padding horizontal de pantalla: `space.2xl` (24) o `space.3xl` (32).
- Ancho de lectura `sizing.readableMaxWidth` (360).
- Touch target mínimo 44pt en todo control.

### 2.7 Estados

| Estado                 | Tratamiento                                                                     |
| ---------------------- | ------------------------------------------------------------------------------- |
| Selected (card/choice) | borde `thick` `primary` + fondo `primaryTint` + check                           |
| Pressed                | `opacity 0.85` o cambio de borde/tinte                                          |
| Disabled               | `opacity 0.45`, sin acción                                                      |
| Error                  | borde `danger`, texto `dangerText`, sin halo (o halo sutil con `dangerSurface`) |
| Vacío                  | borde dashed `borderStrong` + fondo `primarySubtle`                             |

### 2.8 Modo oscuro

- Mismo componente, mismo contrato. Solo cambian los tokens (dark theme).
- Toda pantalla debe revisarse en light y dark con el mismo árbol de componentes.

## 3. Contratos de componente (onboarding)

### 3.1 Navegación y estado — por rutas, sin shell

- Cada pantalla es una **ruta** bajo `(onboarding)/`; la navegación se hace con `router.push` / `router.replace`.
- El `(onboarding)/_layout.tsx` es solo el `Stack` de ruta (cabecera y animación), **no** un shell con props.
- El estado del borrador vive en el **store efímero** (Zustand). Cada pantalla lee y escribe el store directamente; **ninguna pantalla recibe callbacks ni params** desde el padre.
- El chrome (barra de progreso, título, CTA) **se compone dentro de cada pantalla** con los componentes hoja de la tabla siguiente, no mediante un wrapper `OnboardingShell`.

| Componente          | Contrato visual                                                         | Tokens clave                              |
| ------------------- | ----------------------------------------------------------------------- | ----------------------------------------- |
| `ProgressIndicator` | barra aqua segmentada por paso                                          | `primary`, `surfaceSunken`                |
| `PrimaryCTA`        | pill outlined bold, 52h, ancho full                                     | `link`/`primary`, `primaryTint` (pressed) |
| `SecondaryCTA`      | ghost text                                                              | `textMuted`/`link`                        |
| `WheelPicker`       | 3 filas visibles, centro bold, laterales con fade (máscara), sin sombra | `text`, `placeholder`, `link`             |
| `DateWheel`         | 3 `WheelPicker` (día/mes/año)                                           | igual                                     |
| `SegmentedControl`  | pill agrupado; activo = surface + borde bold                            | `surface`, `borderStrong`, `link`         |
| `SelectableCard`    | outlined; activo = borde thick `primary` + `primaryTint` + check        | `primary`, `primaryTint`                  |
| `Stepper`           | − valor + outlined, 48h                                                 | `borderStrong`, `primary`                 |
| `Switch`            | custom 52×32, on = `primary`                                            | `primary`, `surface`                      |
| `Field`             | outlined thick; foco = borde `primary` (sin ring)                       | `borderStrong`, `primary`                 |

## 4. Do / Don’t

**Do**

- Reusar tokens de `src/theme`, nunca hex sueltos.
- Un solo CTA primario por vista.
- Light y dark con el mismo componente.
- Cubrir estados vacío / cargando / error / deshabilitado cuando aplique.

**Don’t**

- Sombras o cards flotantes.
- Botones sólidos como acción principal.
- Focus ring (outline) estilo shadcn.
- Inputs nativos (`number`, `date`) o checkboxes genéricos.
- Padding global que altere el componente documentado.
