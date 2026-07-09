# Queries (Drizzle / SQLite)

## Query builder

```ts
import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '@/db/client';
import { users } from '@/db/schema';

// lista filtrada y ordenada
const active = await db
  .select()
  .from(users)
  .where(and(isNull(users.deletedAt), eq(users.email, email)))
  .orderBy(desc(users.createdAt));

// uno solo
const user = await db.query.users.findFirst({ where: eq(users.id, id) });
```

## Relacional (`db.query`)

```ts
// requiere drizzle(sqlite, { schema }) y relations() definidas — ver estructura
const withPosts = await db.query.users.findMany({
  where: isNull(users.deletedAt),
  with: { posts: true },
});
```

## SQLite crudo: plantilla `sql`

```ts
import { sql } from 'drizzle-orm';

// solo cuando el builder no expresa algo de SQLite
const rows = await db
  .select()
  .from(users)
  .where(sql`lower(${users.email}) = ${email.toLowerCase()}`);
```

## Lectura reactiva

Para UI que se actualiza sola, usa un read-hook con `useLiveQuery`, no estas queries imperativas → `../react/hooks.md`.

## Reglas

- Operadores tipados (`eq`, `and`, `isNull`, `desc`…), no concatenación de strings.
- `findFirst` / `findMany` relacional cuando hay `with`; `select().from()` para lo plano.
- `sql` es la única vía para SQL crudo, siempre con interpolación parametrizada (nunca string-building).
- Sin lógica de negocio aquí: la query solo lee datos (ver estructura).
