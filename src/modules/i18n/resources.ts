import onboarding from "@/lang/es/onboarding.json";
import today from "@/lang/es/today.json";

/**
 * Recursos para i18next: idioma → namespace → claves. Los JSON viven solo en
 * `src/lang/`. Añadir un idioma o namespace = importar su JSON y registrarlo aquí.
 */
export const resources = {
    es: {
        today,
        onboarding,
    },
} as const;
