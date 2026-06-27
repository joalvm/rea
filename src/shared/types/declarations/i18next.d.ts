import "i18next";

import type onboarding from "@/lang/es/onboarding.json";
import type today from "@/lang/es/today.json";

/**
 * Tipado fuerte de claves para `t(...)` y `useTranslation`, derivado de los JSON
 * del idioma base (`es`). Patrón estándar de i18next (`CustomTypeOptions`).
 * Al añadir un namespace, impórtalo y añádelo a `resources`.
 */
declare module "i18next" {
    interface CustomTypeOptions {
        resources: {
            today: typeof today;
            onboarding: typeof onboarding;
        };
        returnNull: false;
    }
}
