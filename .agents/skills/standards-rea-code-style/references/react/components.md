# Componentes

## Anatomía (reutilizable, named export)

```tsx
// ProfileCard.tsx
import { Pressable, Text } from 'react-native';
import { styles } from './ProfileCardStyle';

type Props = {
  user: User;
  onPress: (id: string) => void;
};

export function ProfileCard({ user, onPress }: Props) {
  const fullName = `${user.firstName} ${user.lastName}`; // derivado en render
  const handlePress = () => onPress(user.id);

  return (
    <Pressable
      onPress={handlePress}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel={fullName}
    >
      <Text style={styles.title}>{fullName}</Text>
    </Pressable>
  );
}
```

## Screen (la ruta la reexporta → default export)

```tsx
// ProfileScreen.tsx
export default function ProfileScreen() {
  // composición de subcomponentes del feature
}
```

## Props

```tsx
// ✅ children para contenido; callbacks con on*; sin boolean trap
type Props = {
  title: string;
  variant: 'primary' | 'ghost'; // unión, no isPrimary + isGhost
  onPress: () => void;
  children: ReactNode;
};
```

## Reglas

- Declaración con nombre (`function`); props destructuradas; `Props` arriba en el mismo archivo.
- Handlers internos `handle*`; callbacks de props `on*`.
- No tipar el retorno; no `React.FC`.
- `ref` es una prop normal (React 19): sin `forwardRef`.
