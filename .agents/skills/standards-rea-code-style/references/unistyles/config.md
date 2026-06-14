# Configuración de temas (Unistyles 3)

La config se ejecuta una sola vez al arrancar y vive en `theme/` (ver estructura).

## `StyleSheet.configure`

```ts
// theme/unistyles.ts
import { StyleSheet } from 'react-native-unistyles';

const lightTheme = {
  colors: { background: '#FFFFFF', surface: '#F4F4F5', text: '#18181B', primary: '#5B8DEF' },
  gap: (v: number) => v * 8,
} as const;

const darkTheme = {
  colors: { background: '#09090B', surface: '#18181B', text: '#FAFAFA', primary: '#5B8DEF' },
  gap: (v: number) => v * 8,
} as const;

const breakpoints = { xs: 0, sm: 360, md: 768, lg: 1024 } as const;

StyleSheet.configure({
  themes: { light: lightTheme, dark: darkTheme },
  breakpoints,
  settings: { adaptiveThemes: true }, // sigue el color scheme del dispositivo
});
```

## Tipado (override de la librería)

```ts
// theme/unistyles.d.ts
import type { lightTheme, darkTheme, breakpoints } from './unistyles';

type AppThemes = { light: typeof lightTheme; dark: typeof darkTheme };
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}
```

## Cambio de tema en runtime

```ts
import { UnistylesRuntime } from 'react-native-unistyles';

UnistylesRuntime.setTheme('dark');                        // sin re-render
UnistylesRuntime.updateTheme('light', (t) => ({ ...t })); // editar un theme en caliente
```

## Reglas

- Una sola llamada a `StyleSheet.configure`, importada en el `_layout` raíz (ver estructura).
- `light` / `dark` son el cromo. Un estado de dominio NO es un theme nuevo (ver `stylesheets.md`).
- `setTheme` actualiza vía el Shadow Tree sin re-render; evita `useUnistyles` (re-renderiza el componente).
