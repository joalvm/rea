import { DailyLog, MoodCheckIn } from "@/types/records.types";
import { labelSymptom } from "@/modules/cycle/utils/symptomCatalog";
import { translate } from "@/modules/localization/i18n";

/** Devuelve icono del momento registrado. */
export function momentIcon(momentType: MoodCheckIn["momentType"]) {
    if (momentType === "morning") return "weather-sunset-up";
    if (momentType === "night") return "weather-night";
    return "clock-outline";
}

/** Devuelve título legible del momento registrado. */
export function momentLabel(momentType: MoodCheckIn["momentType"]) {
    if (momentType === "morning") return translate("diary:moment.morning");
    if (momentType === "night") return translate("diary:moment.night");
    return translate("diary:moment.now");
}

/** Traduce el sangrado observado a una etiqueta breve. */
export function bleedingLabel(level: DailyLog["bleedingLevel"]) {
    if (level === "none") return translate("diary:bleeding.none");
    if (level === "spotting") return translate("diary:bleeding.spotting");
    if (level === "light") return translate("diary:bleeding.light");
    if (level === "medium") return translate("diary:bleeding.medium");
    return translate("diary:bleeding.heavy");
}

/** Traduce la fuente del día a una etiqueta visible. */
export function sourceLabel(source: DailyLog["source"]) {
    if (source === "estimated") return translate("common:sources.estimated");
    if (source === "unknown") return translate("common:sources.unknown");
    return translate("common:sources.observed");
}

/** Resume detalles opcionales del registro diario en chips legibles. */
export function buildDailyLogDetails(log: DailyLog) {
    const items: string[] = [];

    if (log.details?.periodStarted) items.push(translate("diary:dailyDetails.periodStarted"));
    if (log.details?.periodEnded) items.push(translate("diary:dailyDetails.periodEnded"));
    if (log.details?.pmsState === "starting") items.push(translate("diary:dailyDetails.pmsStarting"));
    if (log.details?.pmsState === "present") items.push(translate("diary:dailyDetails.pmsPresent"));
    if (!log.details?.pmsState && log.details?.pmsStarted) items.push(translate("diary:dailyDetails.pmsStarted"));

    if (log.details?.painImpact === "noticeable") items.push(translate("diary:dailyDetails.painImpactNoticeable"));
    if (log.details?.painImpact === "limits_day") items.push(translate("diary:dailyDetails.painImpactLimits"));
    if (log.details?.painImpact === "stops_day") items.push(translate("diary:dailyDetails.painImpactStops"));

    if ((log.details?.breastSensitivity ?? 0) > 0) {
        items.push(translate("diary:dailyDetails.breastSensitivity", { value: log.details?.breastSensitivity }));
    }

    if (log.details?.painLocations && log.details.painLocations.length > 0) {
        items.push(translate("diary:dailyDetails.painLocations", { locations: log.details.painLocations.join(", ") }));
    }

    if (log.details?.libidoLevel === "very_low") items.push(translate("diary:dailyDetails.libidoVeryLow"));
    if (log.details?.libidoLevel === "low") items.push(translate("diary:dailyDetails.libidoLow"));
    if (log.details?.libidoLevel === "high") items.push(translate("diary:dailyDetails.libidoHigh"));

    if (log.details?.medicationName) {
        items.push(log.details.medicationName);
    }

    if (log.details?.medicationRelief === "helped") items.push(translate("diary:dailyDetails.medicationHelped"));
    if (log.details?.medicationRelief === "partly_helped") items.push(translate("diary:dailyDetails.medicationPartly"));
    if (log.details?.medicationRelief === "did_not_help") items.push(translate("diary:dailyDetails.medicationNoHelp"));

    if (log.details?.clotSize === "small") items.push(translate("diary:dailyDetails.clotSmall"));
    if (log.details?.clotSize === "medium") items.push(translate("diary:dailyDetails.clotMedium"));
    if (log.details?.clotSize === "large") items.push(translate("diary:dailyDetails.clotLarge"));

    return items;
}

/** Traduce síntomas guardados a etiquetas visibles. */
export function symptomLabel(symptom: DailyLog["symptoms"][number]) {
    return labelSymptom(symptom);
}
