import "i18next";

import type onboarding from "@/lang/es/onboarding.json";
import type preview from "@/lang/es/preview.json";

/**
 * Tipado fuerte de claves para `t(...)` y `useTranslation`, derivado de los JSON
 * del idioma base (`es`). Patrón estándar de i18next (`CustomTypeOptions`).
 * Al añadir un namespace, impórtalo y añádelo a `resources`.
 */
declare module "i18next" {
    interface CustomTypeOptions {
        resources: {
            preview: typeof preview;
            onboarding: typeof onboarding;
        };
        returnNull: false;
    }
}
