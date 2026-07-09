import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { FALLBACK_LANGUAGE, SUPPORTED_LANGUAGES } from "@/modules/config/localeCatalog";
import { NAMESPACES } from "@/modules/config/namespaceCatalog";
import { detectDeviceLanguage } from "./deviceLanguage";
import { resources } from "./resources";

/**
 * Configuración de i18next (instancia por defecto, como recomienda la comunidad
 * para una app). Los recursos son locales, así que `init` resuelve de forma
 * síncrona y `t` queda listo apenas se importa este módulo.
 *
 * Se importa una sola vez desde el layout raíz (`src/app/_layout.tsx`). En los
 * componentes se usa `useTranslation("<namespace>")` de `react-i18next`.
 */
// `i18n.use(...).init(...)` es el uso documentado de i18next. La regla de import
// confunde `.use` con el export nombrado `use`; es un falso positivo.
// eslint-disable-next-line import/no-named-as-default-member
void i18n.use(initReactI18next).init({
    resources,
    lng: detectDeviceLanguage(),
    fallbackLng: FALLBACK_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    ns: NAMESPACES,
    interpolation: {
        // React Native no es un DOM: no hay riesgo de inyección HTML.
        escapeValue: false,
    },
    react: {
        useSuspense: false,
    },
});

export default i18n;
