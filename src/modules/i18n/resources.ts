import checkInEn from "@/lang/en/checkIn.json";
import commonEn from "@/lang/en/common.json";
import exceptionEn from "@/lang/en/exception.json";
import onboardingEn from "@/lang/en/onboarding.json";
import periodEn from "@/lang/en/period.json";
import previewEn from "@/lang/en/preview.json";
import validationEn from "@/lang/en/validation.json";
import checkInEs from "@/lang/es/checkIn.json";
import commonEs from "@/lang/es/common.json";
import exceptionEs from "@/lang/es/exception.json";
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
        common: commonEs,
        checkIn: checkInEs,
        exception: exceptionEs,
        preview: previewEs,
        onboarding: onboardingEs,
        period: periodEs,
        validation: validationEs,
    },
    en: {
        common: commonEn,
        checkIn: checkInEn,
        exception: exceptionEn,
        preview: previewEn,
        onboarding: onboardingEn,
        period: periodEn,
        validation: validationEn,
    },
} as const;
