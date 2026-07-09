# Entidades (schema Drizzle)

El schema en TypeScript ES la fuente de las entidades: define tablas y de ahí se infieren los tipos. Vive en `db/schema.ts` (ver estructura).

## Tabla + tipos inferidos

```ts
// db/schema.ts
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(), // UUID
    email: text('email').notNull().unique(),
    displayName: text('display_name').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }), // soft delete
  },
  (t) => [index('users_email_idx').on(t.email)],
);

export type User = typeof users.$inferSelect;     // forma al leer
export type NewUser = typeof users.$inferInsert;  // forma al insertar
```

## Relaciones

```ts
import { relations } from 'drizzle-orm';

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  authorId: text('author_id').notNull().references(() => users.id),
  body: text('body').notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));
```

## Reglas

- Una entidad = una tabla `sqliteTable`. Columnas en snake_case, claves del objeto en camelCase.
- Tipos siempre inferidos con `$inferSelect` / `$inferInsert`; nunca dupliques la forma a mano.
- `references(() => ...)` para FKs; `relations()` para consultas relacionales.
- STRICT, WAL y PRAGMAs se fijan en el cliente/schema (ver estructura); el ID es TEXT (UUID) y el borrado es lógico (`deletedAt`).
- Construir queries → `queries.md`; escribir → `mutations.md`.
