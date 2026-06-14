# Componentes React Native

## Primitivas

```tsx
import { Pressable, Text, View, FlatList } from 'react-native';
```

- `Pressable` para interacción en código nuevo (no `TouchableOpacity`).
- Todo texto dentro de `<Text>`; nunca strings sueltos dentro de `<View>`.

## Listas

```tsx
<FlatList
  data={users}
  keyExtractor={(u) => u.id} // id estable, nunca el índice
  renderItem={({ item }) => <ProfileCard user={item} onPress={onSelect} />}
/>
```

## Plataforma

```tsx
// diferencia pequeña
const padding = Platform.select({ ios: 12, android: 8 });

// diferencia sustancial → archivos por plataforma
// Header.ios.tsx / Header.android.tsx
```

## Accesibilidad

- Elementos interactivos con `accessibilityRole` y `accessibilityLabel`.
- Texto que escala con el sistema; no fijar tamaños que rompan accesibilidad.
