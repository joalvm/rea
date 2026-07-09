# Uso de i18n

## `useTranslation` (namespace explícito)

```tsx
import { useTranslation } from 'react-i18next';

export function Greeting({ name }: Props) {
  const { t } = useTranslation('today');                // namespace de la feature
  return <Text>{t('hero.greeting', { name })}</Text>;   // "Hola, {{name}}"
}
```

Fuera de React (servicios, notificaciones):

```ts
import i18n from '@/modules/i18n/i18n';
i18n.t('hero.overline', { ns: 'today' });
```

## Interpolación y plurales

```ts
t('cycle.daysUnit', { count }); // i18next elige _one/_other según count
```

```json
{
  "cycle": {
    "daysUnit_one": "{{count}} día",
    "daysUnit_other": "{{count}} días"
  }
}
```

## Formato (fechas, números, moneda) → módulo l10n

No formatear a mano: usar los helpers de `modules/l10n`, que envuelven `Intl` con
el locale del sistema. Detalle y reglas en `l10n.md`.

```ts
import { formatDate } from '@/modules/l10n/formatDate';
import { formatCurrency } from '@/modules/l10n/formatCurrency';

formatDate('2026-06-25', 'long'); // "25 de junio de 2026"
formatCurrency(20);               // divisa del sistema (S/ en Perú)
```

## Idioma

Se toma del sistema (Android/iOS). **No hay cambio de idioma en la app**: sin
`changeLanguage`, sin selector, sin persistencia.

## Reglas

- **Ningún string de UI hardcodeado**: todo texto visible pasa por `t()`.
- Namespace explícito siempre (`useTranslation('feature')`); claves jerárquicas por dominio (`hero.greeting`), nunca el texto como clave.
- Plurales con sufijos `_one` / `_other`, no condicionales en el código.
- Fechas/números/moneda → helpers de `l10n` (Intl + sistema), nunca formato manual ni tablas por país.
