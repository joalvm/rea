import "i18next";

import type checkIn from "@/lang/es/checkIn.json";
import type calendar from "@/lang/es/calendar.json";
import type common from "@/lang/es/common.json";
import type content from "@/lang/es/content.json";
import type diary from "@/lang/es/diary.json";
import type exception from "@/lang/es/exception.json";
import type home from "@/lang/es/home.json";
import type notifications from "@/lang/es/notifications.json";
import type onboarding from "@/lang/es/onboarding.json";
import type period from "@/lang/es/period.json";
import type privacy from "@/lang/es/privacy.json";
import type pregnancy from "@/lang/es/pregnancy.json";
import type predictions from "@/lang/es/predictions.json";
import type statistics from "@/lang/es/statistics.json";
import type settings from "@/lang/es/settings.json";
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
            content: typeof content;
            checkIn: typeof checkIn;
            diary: typeof diary;
            exception: typeof exception;
            home: typeof home;
            notifications: typeof notifications;
            onboarding: typeof onboarding;
            period: typeof period;
            privacy: typeof privacy;
            pregnancy: typeof pregnancy;
            predictions: typeof predictions;
            statistics: typeof statistics;
            settings: typeof settings;
            validation: typeof validation;
        };
        returnNull: false;
    }
}
