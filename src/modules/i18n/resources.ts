import checkInEn from "@/lang/en/checkIn.json";
import calendarEn from "@/lang/en/calendar.json";
import commonEn from "@/lang/en/common.json";
import diaryEn from "@/lang/en/diary.json";
import exceptionEn from "@/lang/en/exception.json";
import notificationsEn from "@/lang/en/notifications.json";
import onboardingEn from "@/lang/en/onboarding.json";
import periodEn from "@/lang/en/period.json";
import previewEn from "@/lang/en/preview.json";
import validationEn from "@/lang/en/validation.json";
import checkInEs from "@/lang/es/checkIn.json";
import calendarEs from "@/lang/es/calendar.json";
import commonEs from "@/lang/es/common.json";
import diaryEs from "@/lang/es/diary.json";
import exceptionEs from "@/lang/es/exception.json";
import notificationsEs from "@/lang/es/notifications.json";
import onboardingEs from "@/lang/es/onboarding.json";
import periodEs from "@/lang/es/period.json";
import previewEs from "@/lang/es/preview.json";
import validationEs from "@/lang/es/validation.json";

/**
 * Recursos para i18next: idioma → namespace → claves. Los JSON viven solo en
 * `src/lang/`. Añadir un idioma o namespace = importar su JSON y registrarlo aquí.
 */
export const resources = {
    es: {
        calendar: calendarEs,
        common: commonEs,
        checkIn: checkInEs,
        diary: diaryEs,
        exception: exceptionEs,
        notifications: notificationsEs,
        preview: previewEs,
        onboarding: onboardingEs,
        period: periodEs,
        validation: validationEs,
    },
    en: {
        calendar: calendarEn,
        common: commonEn,
        checkIn: checkInEn,
        diary: diaryEn,
        exception: exceptionEn,
        notifications: notificationsEn,
        preview: previewEn,
        onboarding: onboardingEn,
        period: periodEn,
        validation: validationEn,
    },
} as const;
