# Estado: qué es y dónde vive

## ¿Es estado? (las 3 preguntas)

Un dato NO es estado si:
1. ¿Llega por props del padre? → no es estado.
2. ¿Se mantiene constante en el tiempo? → no es estado (constante de módulo).
3. ¿Se puede calcular desde otro estado o props? → no es estado, es derivado.

```tsx
// ❌ duplicar como estado lo derivable
const [fullName, setFullName] = useState('');
useEffect(() => setFullName(`${first} ${last}`), [first, last]);

// ✅ derivar en render
const fullName = `${first} ${last}`;
```

## Dónde vive

- El ancestro común más cercano que lo necesita posee el estado (lifting state up).
- Colócalo lo más cerca posible de donde se usa; no lo subas más de lo necesario.
- El estado de servidor/DB no es estado de cliente: vive en la base de datos y se lee con read-hooks (ver estructura).

## Estructura del estado

- Mínimo y normalizado; evita redundancia y estados imposibles.
- Modela los estados mutuamente excluyentes con uniones discriminadas (ver `../typescript/narrowing.md`).
