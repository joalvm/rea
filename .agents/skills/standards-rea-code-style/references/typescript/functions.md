# Funciones

## Declaración con nombre vs arrow

```ts
// declaración para funciones de módulo y componentes (mejor stack trace, hoisting)
export function formatDate(date: Date): string {
  return date.toISOString();
}

// arrow para callbacks y expresiones
const ids = users.map((u) => u.id);
const handlePress = () => onPress(user.id);
```

## Anotar el retorno de lo exportado

```ts
// contrato explícito en API pública
export function parseConfig(raw: string): Config { /* ... */ }

// inferencia para helpers internos
const double = (n: number) => n * 2;
```

No anotar el retorno de componentes (`JSX.Element` sobra).

## Parámetros

```ts
// objeto con nombres cuando hay 3+ params o booleanos
function createUser({ email, role, isActive }: CreateUserInput) { /* ... */ }

// ❌ lista posicional confusa
function createUser(email: string, role: string, isActive: boolean) { /* ... */ }
```

- Default params sin efectos secundarios.
- Evita el "boolean trap": prefiere uniones u opciones con nombre.

## Overloads solo si el retorno depende de la entrada

```ts
function parse(input: string): string;
function parse(input: number): number;
function parse(input: string | number) { return input; }
```

Si no, una firma con genéricos es más clara.
