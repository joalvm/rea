# StyleSheets (Unistyles 3)

## Archivo hermano `*Style.ts`

```ts
// ProfileCardStyle.ts
import { StyleSheet } from 'react-native-unistyles';

export const styles = StyleSheet.create((theme, rt) => ({
  container: {
    padding: theme.gap(2),
    paddingTop: rt.insets.top,
    backgroundColor: theme.colors.surface,
  },
  title: {
    color: theme.colors.text,
  },
}));
```

`StyleSheet.create` recibe `(theme, rt)`: el theme tipado y el runtime (`rt.insets`, `rt.screen`, …).

## Variants

```ts
export const styles = StyleSheet.create((theme) => ({
  badge: {
    borderRadius: 999,
    variants: {
      tone: {
        neutral: { backgroundColor: theme.colors.surface },
        primary: { backgroundColor: theme.colors.primary },
      },
    },
  },
}));

// en el componente: hay que activarlas o se ignoran
styles.useVariants({ tone: 'primary' });
```

## Tokens dinámicos por estado de dominio

```ts
// un mapa de tokens, NO un theme nuevo por estado
const accentByStatus = {
  active: theme.colors.primary,
  warning: '#E5A23D',
  error: '#E5484D',
} as const;
```

## Reglas

- Nombres semánticos (`container`, `title`, `errorText`), no posicionales (`view1`, `wrapper2`).
- Tokens del theme siempre; nunca colores ni spacing mágicos.
- Variants: defínelas en el stylesheet y actívalas con `styles.useVariants(...)`, o el parser las ignora.
- Estado de dominio = mapa de tokens de acento; la transición animada del hero va con Reanimated, no cambiando de theme.
- Inline solo en componentes triviales. Ubicación del `*Style.ts`: ver estructura.
