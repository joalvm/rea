import previewEn from "@/lang/en/preview.json";
import previewEs from "@/lang/es/preview.json";

/**
 * Recursos para i18next: idioma → namespace → claves. Los JSON viven solo en
 * `src/lang/`. Añadir un idioma o namespace = importar su JSON y registrarlo aquí.
 */
export const resources = {
    es: {
        preview: previewEs,
    },
    en: {
        preview: previewEn,
    },
} as const;
