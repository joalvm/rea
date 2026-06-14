# Setup de i18n (react-i18next + expo-localization)

Init única; vive en `modules/i18n` y los recursos JSON en `lang/` (ver estructura).

## Inicialización

```ts
// modules/i18n/index.ts
import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from '@/lang/es/common.json';
import en from '@/lang/en/common.json';

i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en } },
  lng: getLocales()[0]?.languageCode ?? 'es', // locale del dispositivo
  fallbackLng: 'es',
  interpolation: { escapeValue: false }, // React Native ya escapa
});

export default i18n;
```

`getLocales()` devuelve los locales preferidos del usuario en orden de prioridad.

## Carga única

```ts
// app/_layout.tsx — importar una vez como side-effect
import '@/modules/i18n';
```

## Claves tipadas

```ts
// modules/i18n/i18next.d.ts
import type es from '@/lang/es/common.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof es };
  }
}
```

## Reglas

- Una sola init, importada en el `_layout` raíz.
- Recursos = solo JSON en `lang/`; el idioma base es estándar y las variantes regionales solo overrides (ver estructura).
- `escapeValue: false` en React Native.
- Aumenta el módulo `i18next` para autocompletar y validar claves en compilación.
- Uso de `t()` y formato → `usage.md`.
