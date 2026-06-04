import i18next, { TOptions, t } from "i18next";
import { initReactI18next } from "react-i18next";

import { selectedLanguage, selectedLocale } from "./currentLocale";
import { namespaces, resources } from "./resources";

const i18nInstance = i18next;

void i18nInstance.use(initReactI18next).init({
    compatibilityJSON: "v4",
    defaultNS: "common",
    fallbackLng: selectedLanguage,
    interpolation: {
        escapeValue: false,
    },
    lng: selectedLocale,
    ns: namespaces,
    resources,
    returnNull: false,
});

export function translate(key: string, options?: TOptions) {
    return String(t(key, options));
}

export default i18next;
