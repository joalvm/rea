# Acceso a datos por entidad (Drizzle)

Funciones tipadas que envuelven las queries y mutaciones de una entidad. Su ubicación y el desglose por archivo los define la skill de estructura (típicamente un archivo por operación, `verbo + entidad`); aquí va el patrón.

## Funciones exportadas (`verbo + entidad`)

```ts
import { eq, isNull } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, type NewUser, type User } from '@/db/schema';

export function getUserById(id: string): Promise<User | undefined> {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}

export function listActiveUsers(): Promise<User[]> {
  return db.select().from(users).where(isNull(users.deletedAt));
}

export async function createUser(data: NewUser): Promise<User> {
  const [row] = await db.insert(users).values(data).returning();
  return row;
}

export async function softDeleteUser(id: string): Promise<void> {
  await db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, id));
}
```

## Reglas

- Funciones exportadas con nombre `verbo + entidad` (`createUser`, `getUserById`).
- Solo acceso a datos: nada de UI ni de estado.
- La lógica de negocio (validar, transformar, orquestar) vive en el feature o el store que las llama (ver estructura).
- Las escrituras se invocan desde el store/feature; las lecturas reactivas usan read-hooks (`../react/hooks.md`).
