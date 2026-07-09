# Selectores (Zustand)

## Primitivo: selección directa

```ts
const userId = useSessionStore((s) => s.userId);
const isOnboarded = useSessionStore((s) => s.isOnboarded);
```

## Objeto o array: `useShallow`

```ts
import { useShallow } from 'zustand/react/shallow';

const { userId, isOnboarded } = useSessionStore(
  useShallow((s) => ({ userId: s.userId, isOnboarded: s.isOnboarded })),
);
```

## Actions

```ts
// las actions son referencias estables: selecciónalas directo, sin useShallow
const setUser = useSessionStore((s) => s.setUser);
```

## Reglas

- Selecciona siempre lo mínimo; nunca el store entero (`useStore()` sin selector): re-renderiza en cada cambio.
- `useShallow` (de `zustand/react/shallow`) solo al devolver un objeto o array; innecesario para primitivos.
- Las actions no cambian de referencia: selecciónalas directo.
- Pocos valores: un selector por valor. Varios juntos: agrúpalos con `useShallow`.
