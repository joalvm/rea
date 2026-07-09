# Valores: nulabilidad, opcionales e inmutabilidad

## null / undefined / opcional

```ts
// ✅ campo opcional, no | undefined en el alias
type Profile = {
  bio?: string;
};

// ✅ defaults con ??, acceso con ?.
const bio = profile.bio ?? 'Sin biografía';
const city = profile.address?.city;
```

- `===` siempre; `== null` / `!= null` solo para chequear null+undefined juntos.
- No bakear `| null | undefined` en el alias; añade la nulabilidad en el punto de uso.

## `as const` para literales

```ts
const ROUTES = ['home', 'profile', 'settings'] as const;
type Route = typeof ROUTES[number]; // 'home' | 'profile' | 'settings'

const CONFIG = { retries: 3, timeoutMs: 5000 } as const;
```

## `readonly`

```ts
type Point = { readonly x: number; readonly y: number };
function sum(values: readonly number[]): number { /* no muta el input */ }
```

## `satisfies`

```ts
// valida la forma sin ensanchar ni perder el literal
const palette = {
  primary: '#5B8DEF',
  danger: '#E5484D',
} satisfies Record<string, string>;
// palette.primary sigue siendo el string literal, no string
```

- Nunca el constructor `Array()`; usa `[]`.
