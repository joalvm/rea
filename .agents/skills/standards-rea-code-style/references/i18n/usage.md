# Uso de i18n

## `useTranslation`

```tsx
import { useTranslation } from 'react-i18next';

export function Greeting({ name }: Props) {
  const { t } = useTranslation();
  return <Text>{t('home.greeting', { name })}</Text>; // "Hola, {{name}}"
}
```

## Interpolación y plurales

```ts
t('cart.items', { count }); // i18next elige singular/plural según count
```

```json
{
  "cart": {
    "items_one": "{{count}} artículo",
    "items_other": "{{count}} artículos"
  }
}
```

## Formato de fechas y números

```ts
// usa Intl con el locale activo, no formato manual
const price = new Intl.NumberFormat(i18n.language, {
  style: 'currency',
  currency: 'PEN',
}).format(amount);
```

## Cambiar idioma

```ts
import i18n from '@/modules/i18n';
await i18n.changeLanguage('en');
```

## Reglas

- **Ningún string de UI hardcodeado**: todo texto visible pasa por `t()`.
- Claves jerárquicas por dominio (`home.greeting`, `cart.items`), nunca el texto como clave.
- Plurales con sufijos `_one` / `_other`, no condicionales en el código.
- Fechas, números y monedas con `Intl`, usando `i18n.language`.
