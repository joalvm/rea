# Tipos: declaración

## `type` por defecto

```ts
// shapes, uniones e intersecciones
export type User = {
  id: string;
  email: string;
  role: Role;
};

export type Role = 'admin' | 'member' | 'guest'; // unión literal, no enum
export type WithTimestamps<T> = T & { createdAt: string; updatedAt: string };
```

## `interface` solo para declaration merging

```ts
// aumentar el tipo de una librería
declare module 'some-lib' {
  interface Config {
    featureFlag: boolean;
  }
}
```

## Derivar en vez de duplicar

```ts
export type UserDraft = Omit<User, 'id'>;
export type UsersById = Record<string, User>;
```

## Reglas

- Un tipo por archivo con nombre de responsabilidad (ver estructura). No `*.types.ts`.
- Uniones literales en vez de `enum`.
- Utility types con criterio (`Pick`, `Omit`, `Partial`, `Readonly`, `Record`). Evita tipos condicionales ilegibles.
- No bakear `| null | undefined` en el alias; usa campo opcional (ver `values.md`).
