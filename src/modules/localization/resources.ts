import esApp from "@/lang/es/app.json";
import esCalendar from "@/lang/es/calendar.json";
import esCheckIn from "@/lang/es/checkIn.json";
import esCommon from "@/lang/es/common.json";
import esContent from "@/lang/es/content.json";
import esContentSources from "@/lang/es/contentSources.json";
import esCycle from "@/lang/es/cycle.json";
import esDayDetail from "@/lang/es/dayDetail.json";
import esDiary from "@/lang/es/diary.json";
import esFormats from "@/lang/es/formats.json";
import esNavigation from "@/lang/es/navigation.json";
import esNotifications from "@/lang/es/notifications.json";
import esOnboarding from "@/lang/es/onboarding.json";
import esPatterns from "@/lang/es/patterns.json";
import esSettings from "@/lang/es/settings.json";
import esTerms from "@/lang/es/terms.json";
import esToday from "@/lang/es/today.json";
import esPEContent from "@/lang/es-PE/content.json";
import esPEContentSources from "@/lang/es-PE/contentSources.json";
import esPEFormats from "@/lang/es-PE/formats.json";
import esPETerms from "@/lang/es-PE/terms.json";

import { AppLanguage, AppLocale, selectedLanguage, selectedLocale } from "./currentLocale";

export const namespaces = [
    "app",
    "common",
    "navigation",
    "today",
    "calendar",
    "diary",
    "dayDetail",
    "patterns",
    "checkIn",
    "content",
    "contentSources",
    "settings",
    "onboarding",
    "notifications",
    "cycle",
    "terms",
    "formats",
] as const;

export type LocalizationNamespace = (typeof namespaces)[number];

export interface LocaleFormats {
    locale: string;
    currency: {
        code: string;
        symbol: string;
        name: string;
    };
    dateTime: {
        shortDate: string;
        longDate: string;
        time: string;
    };
    weekdays: {
        narrow: string[];
    };
}

type PartialLocaleFormats = Partial<Omit<LocaleFormats, "currency" | "dateTime" | "weekdays">> & {
    currency?: Partial<LocaleFormats["currency"]>;
    dateTime?: Partial<LocaleFormats["dateTime"]>;
    weekdays?: Partial<LocaleFormats["weekdays"]>;
};

const baseSpanishFormats = esFormats as LocaleFormats;
const peruvianSpanishFormats = mergeFormats(baseSpanishFormats, esPEFormats as PartialLocaleFormats);

export const resources = {
    es: {
        app: esApp,
        calendar: esCalendar,
        checkIn: esCheckIn,
        common: esCommon,
        content: esContent,
        contentSources: esContentSources,
        cycle: esCycle,
        dayDetail: esDayDetail,
        diary: esDiary,
        formats: esFormats,
        navigation: esNavigation,
        notifications: esNotifications,
        onboarding: esOnboarding,
        patterns: esPatterns,
        settings: esSettings,
        terms: esTerms,
        today: esToday,
    },
    "es-PE": {
        content: esPEContent,
        contentSources: esPEContentSources,
        formats: esPEFormats,
        terms: esPETerms,
    },
} as const;

const localeFormats: Record<AppLanguage | AppLocale, LocaleFormats> = {
    es: baseSpanishFormats,
    "es-PE": peruvianSpanishFormats,
};

export function getLocaleFormats(locale: AppLanguage | AppLocale = selectedLocale): LocaleFormats {
    return localeFormats[locale] ?? localeFormats[selectedLanguage];
}

function mergeFormats(base: LocaleFormats, override: PartialLocaleFormats): LocaleFormats {
    return {
        ...base,
        ...override,
        currency: {
            ...base.currency,
            ...override.currency,
        },
        dateTime: {
            ...base.dateTime,
            ...override.dateTime,
        },
        weekdays: {
            ...base.weekdays,
            ...override.weekdays,
        },
    };
}
