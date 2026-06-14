# Hooks

## Anatomía (hook genérico)

```ts
// useDebouncedValue.ts
import { useEffect, useState } from 'react';

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id); // limpieza del recurso externo
  }, [value, delayMs]);

  return debounced;
}
```

## Read-hook (lectura de datos con live query)

```ts
// useUserProfile.ts
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';

export function useUserProfile(userId: string) {
  return useLiveQuery(db.select().from(users).where(eq(users.id, userId)));
}
```

## Reglas

- Reglas de los hooks: solo en el tope del componente o de otro hook, nunca en condicionales ni loops.
- Una responsabilidad por hook. Si hace dos cosas, son dos hooks.
- Retorna un objeto con nombres (`{ data, isReady }`), salvo el patrón par `[value, setValue]`.
- Dueño claro: si lo usa un solo componente, vive junto a él; si varios, sube (ver estructura).
- La UI nunca consulta la base de datos directo; usa un read-hook.
