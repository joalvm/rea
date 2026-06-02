import { parseIsoDate } from "@/modules/cycle/utils/cycleDate.utils";
import { labelSymptom } from "@/modules/cycle/utils/symptomCatalog";
import { formatLongDate as formatLocalizedLongDate } from "@/modules/localization/formatters";
import { translate } from "@/modules/localization/i18n";
import { colors } from "@/theme";
import { PhaseKey } from "@/types/cycle.types";
import { DailyLog, MoodCheckIn } from "@/types/records.types";
import { DayDetailCareTip } from "../day-detail.types";

/** Resume el día seleccionado según registros y contexto temporal. */
export function buildDaySummary(
    selectedIso: string,
    todayIso: string,
    phaseMessage: string,
    dailyLog: DailyLog | null,
    moments: MoodCheckIn[],
) {
    if (dailyLog) {
        const symptomCopy =
            dailyLog.symptoms.length > 0
                ? translate("dayDetail:quickRead.symptoms", {
                      symptoms: dailyLog.symptoms
                          .slice(0, 3)
                          .map((item) => labelSymptom(item))
                          .join(", "),
                  })
                : translate("dayDetail:quickRead.symptomsEmpty");
        const noteCopy = dailyLog.notes ? translate("dayDetail:quickRead.note", { note: dailyLog.notes }) : "";
        return translate("dayDetail:quickRead.observed", { noteCopy, symptomCopy }).trim();
    }

    if (moments.length > 0) {
        const latest = moments[0];
        if (!latest) {
            return translate("dayDetail:quickRead.momentsFallback");
        }

        return translate("dayDetail:quickRead.latestMoment", {
            count: moments.length,
            mood: latest.mood,
            pain: latest.pain,
        });
    }

    if (selectedIso > todayIso) {
        return translate("dayDetail:quickRead.future");
    }

    if (selectedIso === todayIso) {
        return translate("dayDetail:quickRead.today");
    }

    return translate("dayDetail:quickRead.noRecord");
}

/** Resume detalles opcionales del log diario en chips legibles. */
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

/** Traduce el sangrado a una etiqueta corta para detalle diario. */
export function bleedingLabel(level: DailyLog["bleedingLevel"]) {
    if (level === "none") return translate("diary:bleeding.none");
    if (level === "spotting") return translate("diary:bleeding.spotting");
    if (level === "light") return translate("diary:bleeding.light");
    if (level === "medium") return translate("diary:bleeding.medium");
    return translate("diary:bleeding.heavy");
}

/** Traduce la procedencia del dato diario. */
export function sourceLabel(source: DailyLog["source"]) {
    if (source === "estimated") return translate("common:sources.estimated");
    if (source === "unknown") return translate("common:sources.unknown");
    return translate("common:sources.observed");
}

/** Devuelve el título legible de un momento guardado. */
export function momentLabel(momentType: MoodCheckIn["momentType"]) {
    if (momentType === "morning") return translate("diary:moment.morning");
    if (momentType === "night") return translate("diary:moment.night");
    return translate("diary:moment.now");
}

/** Formatea fecha larga del día seleccionado. */
export function formatLongDate(iso: string) {
    return formatLocalizedLongDate(parseIsoDate(iso));
}

/** Devuelve consejos suaves contextualizados por fase. */
export function getCareTips(phase: PhaseKey): DayDetailCareTip[] {
    if (phase === "menstrual") {
        return [
            {
                icon: "tea-outline",
                text: translate("dayDetail:care.menstrual.warmth"),
                color: colors.period,
                background: colors.periodSoft,
            },
            {
                icon: "pulse",
                text: translate("dayDetail:care.menstrual.painChange"),
                color: colors.primaryDeep,
                background: colors.primarySoft,
            },
        ];
    }

    if (phase === "follicular") {
        return [
            {
                icon: "walk",
                text: translate("dayDetail:care.follicular.movement"),
                color: colors.success,
                background: colors.fertileSoft,
            },
            {
                icon: "notebook-heart-outline",
                text: translate("dayDetail:care.follicular.trackSleepMood"),
                color: colors.primaryDeep,
                background: colors.primarySoft,
            },
        ];
    }

    if (phase === "fertile") {
        return [
            {
                icon: "leaf",
                text: translate("dayDetail:care.fertile.bodySigns"),
                color: colors.success,
                background: colors.fertileSoft,
            },
            {
                icon: "thermometer-lines",
                text: translate("dayDetail:care.fertile.temperature"),
                color: colors.primaryDeep,
                background: colors.primarySoft,
            },
        ];
    }

    return [
        {
            icon: "weather-night",
            text: translate("dayDetail:care.luteal.rest"),
            color: "#7A5EC9",
            background: colors.lutealSoft,
        },
        {
            icon: "heart-outline",
            text: translate("dayDetail:care.luteal.observeMoodStress"),
            color: colors.period,
            background: colors.periodSoft,
        },
    ];
}
