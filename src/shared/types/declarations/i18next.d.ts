import "i18next";

import type checkIn from "@/lang/es/checkIn.json";
import type calendar from "@/lang/es/calendar.json";
import type common from "@/lang/es/common.json";
import type diary from "@/lang/es/diary.json";
import type exception from "@/lang/es/exception.json";
import type notifications from "@/lang/es/notifications.json";
import type onboarding from "@/lang/es/onboarding.json";
import type period from "@/lang/es/period.json";
import type preview from "@/lang/es/preview.json";
import type validation from "@/lang/es/validation.json";

/**
 * Tipado fuerte de claves para `t(...)` y `useTranslation`, derivado de los JSON
 * del idioma base (`es`). Patrón estándar de i18next (`CustomTypeOptions`).
 * Al añadir un namespace, impórtalo y añádelo a `resources`.
 */
declare module "i18next" {
    interface CustomTypeOptions {
        resources: {
            calendar: typeof calendar;
            common: typeof common;
            checkIn: typeof checkIn;
            diary: typeof diary;
            exception: typeof exception;
            notifications: typeof notifications;
            preview: typeof preview;
            onboarding: typeof onboarding;
            period: typeof period;
            validation: typeof validation;
        };
        returnNull: false;
    }
}
