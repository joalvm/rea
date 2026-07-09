# Componentización: cómo partir la UI

Modelo mental canónico ("Thinking in React") + práctica 2026. Meta: un árbol de componentes con los datos fluyendo en una sola dirección.

## Los cinco pasos

1. **Partir la UI en jerarquía.** Dibuja cajas sobre el mock; cada caja con una sola responsabilidad es un componente. La UI suele mapear el modelo de datos: un componente por pieza del modelo.
2. **Versión estática primero.** Renderiza el modelo con props, sin estado ni interactividad.
3. **Estado mínimo.** Encuentra el conjunto mínimo de estado mutable (ver `state.md`, las 3 preguntas).
4. **Dónde vive el estado.** El ancestro común más cercano que lo necesita lo posee (ver `state.md`).
5. **Flujo inverso.** Los hijos comunican cambios hacia arriba con callbacks (`onChange`, `onSelect`).

## Cuándo extraer un componente (SRP)

Una sola razón para cambiar. Extrae cuando el componente:
- hace dos cosas a la vez (busca datos + transforma + renderiza),
- repite un bloque de UI,
- crece más allá de una pantalla de scroll,
- mezcla responsabilidades (red, UI, validación, storage) en un archivo.

```tsx
// ❌ god component: fetch + estado + transformación + UI
function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  useEffect(() => { /* fetch + map + sort */ }, []);
  return <View>{/* 200 líneas */}</View>;
}

// ✅ datos en un hook, UI como composición
function Dashboard() {
  const { data: users } = useActiveUsers();
  return (
    <View>
      <DashboardHeader />
      <UserList users={users} />
    </View>
  );
}
```

## Composición sobre configuración

```tsx
// ✅ children para componer; props pequeñas y con intención
<Card>
  <CardTitle>Perfil</CardTitle>
  <CardBody>{children}</CardBody>
</Card>

// ❌ explosión de props opcionales que cubren cada caso
<Card title titleColor icon iconPosition footer footerAlign /* ... */ />
```

## Antipatrones

- God components con estado, lógica, handlers y UI mezclados.
- Demasiadas props opcionales para cubrir cada borde.
- Filtrar detalles de implementación de bajo nivel por props.
- Atar el componente a la forma de una API o servicio concreto.
