# Setup de i18n (react-i18next + expo-localization)

Init única en `modules/i18n`; recursos JSON en `lang/`. **Instancia por defecto** de
i18next (lo estándar para una app). El idioma sale del sistema: la usuaria no lo
elige. Formato (fechas/números/moneda) → `l10n.md`.

## Estructura

```
modules/
  config/
    localeCatalog.ts      # FALLBACK_LANGUAGE, SUPPORTED_LANGUAGES
    namespaceCatalog.ts   # NAMESPACES (un namespace por feature)
  i18n/
    i18n.ts               # init única (default export i18n)
    resources.ts          # idioma → namespace → JSON
    deviceLanguage.ts     # idioma del sistema
    i18next.d.ts          # claves tipadas
lang/
  es/today.json
  es/onboarding.json      # mismos archivos en cada idioma; distinto texto
```

## Idioma desde el sistema

```ts
// modules/i18n/deviceLanguage.ts
import { getLocales } from 'expo-localization';
import { FALLBACK_LANGUAGE, SUPPORTED_LANGUAGES } from '@/modules/config/localeCatalog';

export function detectDeviceLanguage(): string {
  const supported: readonly string[] = SUPPORTED_LANGUAGES;
  for (const locale of getLocales()) {
    if (locale.languageCode && supported.includes(locale.languageCode)) return locale.languageCode;
  }
  return FALLBACK_LANGUAGE;
}
```

## Inicialización

```ts
// modules/i18n/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { FALLBACK_LANGUAGE, SUPPORTED_LANGUAGES } from '@/modules/config/localeCatalog';
import { NAMESPACES } from '@/modules/config/namespaceCatalog';
import { detectDeviceLanguage } from './deviceLanguage';
import { resources } from './resources';

// `i18n.use(...).init(...)` es el uso documentado; la regla de import confunde
// `.use` con el export nombrado `use` (falso positivo).
// eslint-disable-next-line import/no-named-as-default-member
void i18n.use(initReactI18next).init({
  resources,
  lng: detectDeviceLanguage(),
  fallbackLng: FALLBACK_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES,
  ns: NAMESPACES,                          // sin defaultNS: namespace siempre explícito
  interpolation: { escapeValue: false },   // React Native no es DOM
  react: { useSuspense: false },
});

export default i18n;
```

Recursos locales ⇒ init **síncrona**. Importar una vez como side-effect:

```ts
// app/_layout.tsx
import '@/modules/i18n/i18n';
```

## Recursos por idioma + namespaces por feature

```ts
// modules/i18n/resources.ts
import today from '@/lang/es/today.json';
import onboarding from '@/lang/es/onboarding.json';

export const resources = { es: { today, onboarding } } as const;
```

Mismos archivos en cada idioma, distinto texto. Añadir idioma = crear
`lang/<lng>/*.json` (mismos nombres) + registrar una línea aquí.

## Claves tipadas

```ts
// modules/i18n/i18next.d.ts
import 'i18next';
import type today from '@/lang/es/today.json';
import type onboarding from '@/lang/es/onboarding.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { today: typeof today; onboarding: typeof onboarding };
    returnNull: false; // t() devuelve string, nunca null
  }
}
```

## Reglas

- Una sola init; instancia por defecto (no `createInstance`); side-effect import en el `_layout` raíz.
- **Idioma del sistema** (`expo-localization`): sin selector, sin `changeLanguage`, sin persistencia.
- **Un namespace por feature** (`today`, `onboarding`…); JSON solo en `lang/`. Sin `defaultNS`: `useTranslation('ns')` siempre explícito.
- Idioma base = 100 % de las claves. Variante regional **solo si el texto difiere** (no por formato → eso es `l10n.md`).
- `escapeValue: false` (RN). Aumenta `i18next` para autocompletar y validar claves.
- Key inexistente ⇒ devuelve la key (como Laravel): no hay texto oculto.
