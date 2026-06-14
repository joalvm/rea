# Rules of React: render, pureza, efectos

La base que permite al React Compiler optimizar. Lint: `eslint-plugin-react-hooks` (reglas `purity` e `immutability`).

## Render puro: nada impuro en render

Devuelven distinto con las mismas entradas. Van en handlers, efectos o lazy init:

- `Math.random()`
- `Date.now()` / `new Date()`
- `crypto.randomUUID()`
- `performance.now()`
- lectura de globales mutables

## Inmutabilidad: props, estado y contexto son snapshots

```ts
// ❌ muta
items.push(item); setItems(items);
user.name = 'X';
setItems(items.sort());

// ✅ valor nuevo
setItems([...items, item]);
setUser({ ...user, name: 'X' });
setItems(items.toSorted(byName));
```

Inmutables: `toSorted`, `toSpliced`, `with`, spread. Evitar `sort`, `push`, `splice` y la asignación directa sobre estado.

## Efectos: solo para sincronizar con sistemas externos

```ts
// ✅ suscripción externa con limpieza
useEffect(() => {
  const sub = subscribe(onEvent);
  return () => sub.remove();
}, [onEvent]);
```

- SÍ: storage, suscripciones, timers, eventos nativos, sincronización con un sistema externo.
- NO: transformar datos para render (deriva en render); responder a un evento del usuario (va en el handler).
- Siempre limpieza si el efecto abre un recurso.
