import checkInEn from "@/lang/en/checkIn.json";
import calendarEn from "@/lang/en/calendar.json";
import commonEn from "@/lang/en/common.json";
import contentEn from "@/lang/en/content.json";
import diaryEn from "@/lang/en/diary.json";
import exceptionEn from "@/lang/en/exception.json";
import homeEn from "@/lang/en/home.json";
import notificationsEn from "@/lang/en/notifications.json";
import onboardingEn from "@/lang/en/onboarding.json";
import periodEn from "@/lang/en/period.json";
import privacyEn from "@/lang/en/privacy.json";
import pregnancyEn from "@/lang/en/pregnancy.json";
import predictionsEn from "@/lang/en/predictions.json";
import statisticsEn from "@/lang/en/statistics.json";
import settingsEn from "@/lang/en/settings.json";
import validationEn from "@/lang/en/validation.json";
import checkInEs from "@/lang/es/checkIn.json";
import calendarEs from "@/lang/es/calendar.json";
import commonEs from "@/lang/es/common.json";
import contentEs from "@/lang/es/content.json";
import diaryEs from "@/lang/es/diary.json";
import exceptionEs from "@/lang/es/exception.json";
import homeEs from "@/lang/es/home.json";
import notificationsEs from "@/lang/es/notifications.json";
import onboardingEs from "@/lang/es/onboarding.json";
import periodEs from "@/lang/es/period.json";
import privacyEs from "@/lang/es/privacy.json";
import pregnancyEs from "@/lang/es/pregnancy.json";
import predictionsEs from "@/lang/es/predictions.json";
import statisticsEs from "@/lang/es/statistics.json";
import settingsEs from "@/lang/es/settings.json";
import validationEs from "@/lang/es/validation.json";

/**
 * Recursos para i18next: idioma → namespace → claves. Los JSON viven solo en
 * `src/lang/`. Añadir un idioma o namespace = importar su JSON y registrarlo aquí.
 */
export const resources = {
    es: {
        calendar: calendarEs,
        common: commonEs,
        content: contentEs,
        checkIn: checkInEs,
        diary: diaryEs,
        exception: exceptionEs,
        home: homeEs,
        notifications: notificationsEs,
        onboarding: onboardingEs,
        period: periodEs,
        privacy: privacyEs,
        pregnancy: pregnancyEs,
        predictions: predictionsEs,
        statistics: statisticsEs,
        settings: settingsEs,
        validation: validationEs,
    },
    en: {
        calendar: calendarEn,
        common: commonEn,
        content: contentEn,
        checkIn: checkInEn,
        diary: diaryEn,
        exception: exceptionEn,
        home: homeEn,
        notifications: notificationsEn,
        onboarding: onboardingEn,
        period: periodEn,
        privacy: privacyEn,
        pregnancy: pregnancyEn,
        predictions: predictionsEn,
        statistics: statisticsEn,
        settings: settingsEn,
        validation: validationEn,
    },
} as const;
