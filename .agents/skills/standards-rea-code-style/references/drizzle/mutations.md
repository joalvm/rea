# Mutaciones y transacciones (Drizzle)

## Insert / update / delete

```ts
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, type NewUser, type User } from '@/db/schema';

async function createUser(data: NewUser): Promise<User> {
  const [row] = await db.insert(users).values(data).returning();
  return row;
}

async function rename(id: string, displayName: string): Promise<void> {
  await db.update(users).set({ displayName }).where(eq(users.id, id));
}
```

## Soft delete

```ts
// borrado lógico: marca deletedAt, no DELETE físico
await db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, id));
```

## Transacciones

```ts
await db.transaction(async (tx) => {
  const [user] = await tx.insert(users).values(data).returning();
  await tx.insert(posts).values({ id: newId(), authorId: user.id, body });
}); // rollback automático si algo lanza
```

## Reglas

- `.returning()` para recuperar la fila escrita; desestructura `[row]`.
- Borrado lógico por defecto (`deletedAt`); el DELETE físico es la excepción.
- Varias escrituras que deben ser atómicas → `db.transaction`.
- Sin reglas de negocio aquí (validaciones, transformaciones de dominio): van en el servicio o feature (ver estructura).
