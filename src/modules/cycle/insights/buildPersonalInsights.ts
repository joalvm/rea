import { translate } from "@/modules/localization/i18n";
import { DailyLog, MoodCheckIn } from "@/types/records.types";

import { average } from "../utils/cycleMath.utils";

/** Construye insights simples desde registros recientes. */
export default function buildPersonalInsights(checkIns: MoodCheckIn[], dailyLogs: DailyLog[]): string[] {
    const insights: string[] = [];
    if (checkIns.length < 4) {
        return [translate("cycle:insights.lowHistory")];
    }

    const avgPain = average(checkIns.map((item) => item.pain));
    const avgStress = average(checkIns.map((item) => item.stress));
    const avgEnergy = average(checkIns.map((item) => item.energy));

    if (avgPain >= 3.2) {
        insights.push(translate("cycle:insights.personalPain"));
    }

    if (avgStress >= 3.4) {
        insights.push(translate("cycle:insights.personalStress"));
    }

    if (avgEnergy <= 2.4) {
        insights.push(translate("cycle:insights.personalEnergy"));
    }

    if (dailyLogs.some((log) => log.symptoms.includes("cramps"))) {
        insights.push(translate("cycle:insights.personalCramps"));
    }

    if (dailyLogs.some((log) => log.details?.painImpact === "limits_day" || log.details?.painImpact === "stops_day")) {
        insights.push(translate("cycle:insights.personalPainImpact"));
    }

    if (dailyLogs.some((log) => log.details?.medicationRelief === "did_not_help")) {
        insights.push(translate("cycle:insights.personalMedication"));
    }

    return insights.length > 0 ? insights : [translate("cycle:insights.defaultStable")];
}
