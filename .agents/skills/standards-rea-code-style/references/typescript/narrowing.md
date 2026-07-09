# Estrechamiento y seguridad de tipos

## `unknown` sobre `any`

```ts
// ✅ obliga a estrechar antes de usar
function handle(payload: unknown) {
  if (isUser(payload)) save(payload); // payload: User
}

// ❌ any desactiva el chequeo
function handle(payload: any) { save(payload); }
```

## Type guards en vez de `as`

```ts
// ✅ guard reutilizable
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value;
}

// ❌ aserción ciega
const user = value as User;
```

## Uniones discriminadas + exhaustividad

```ts
type Result =
  | { ok: true; data: User }
  | { ok: false; error: string };

function unwrap(result: Result) {
  switch (result.ok) {
    case true: return result.data;
    case false: throw new Error(result.error);
    default: {
      const _exhaustive: never = result; // falla si se añade una variante
      return _exhaustive;
    }
  }
}
```

## Reglas

- `as` solo `as const`. Nunca para forzar tipos incompatibles.
- `!` (non-null) solo cuando sea demostrablemente seguro; prefiere un guard.
- Modela los imposibles con `never`.
