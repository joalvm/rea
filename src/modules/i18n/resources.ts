import onboardingEn from "@/lang/en/onboarding.json";
import previewEn from "@/lang/en/preview.json";
import onboardingEs from "@/lang/es/onboarding.json";
import previewEs from "@/lang/es/preview.json";

/**
 * Recursos para i18next: idioma → namespace → claves. Los JSON viven solo en
 * `src/lang/`. Añadir un idioma o namespace = importar su JSON y registrarlo aquí.
 */
export const resources = {
    es: {
        preview: previewEs,
        onboarding: onboardingEs,
    },
    en: {
        preview: previewEn,
        onboarding: onboardingEn,
    },
} as const;
