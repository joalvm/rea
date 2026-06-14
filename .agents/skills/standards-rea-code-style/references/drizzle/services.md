# Servicios / repositorios (Drizzle)

Capa fina de acceso a datos: agrupa las queries y mutaciones de una entidad en funciones tipadas. Vive con el feature dueño de la entidad, o en `shared/` si es transversal (ver estructura).

## Anatomía

```ts
// userService.ts
import { eq, isNull } from 'drizzle-orm';
import { db } from '@/db/client';
import { users, type NewUser, type User } from '@/db/schema';

export const userService = {
  getById: (id: string): Promise<User | undefined> =>
    db.query.users.findFirst({ where: eq(users.id, id) }),

  listActive: (): Promise<User[]> =>
    db.select().from(users).where(isNull(users.deletedAt)),

  async create(data: NewUser): Promise<User> {
    const [row] = await db.insert(users).values(data).returning();
    return row;
  },

  softDelete: (id: string): Promise<void> => {
    db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, id));
  },
};
```

## Reglas

- Una agrupación por entidad (`userService`, `postService`); funciones tipadas con `$inferSelect` / `$inferInsert`.
- El servicio es solo acceso a datos: nada de UI ni de estado.
- La lógica de negocio (validar, transformar, orquestar) vive en el feature o el store que llama al servicio (ver estructura).
- Las escrituras se invocan desde el store/feature; las lecturas reactivas usan read-hooks (`../react/hooks.md`).
