import { translate } from "@/modules/localization/i18n";
import { Cycle } from "@/types/cycle.types";
import { EducationalAlert } from "@/types/insights.types";
import { DailyLog, MoodCheckIn } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";

import {
    getObservedCycleLengths,
    getObservedCycleStarts,
    getObservedPeriodRuns,
} from "../utils/cycleObservedData.utils";
import { daysBetween, toIsoDate } from "../utils/cycleDate.utils";
import { countLimitingPainDays } from "../utils/cycleSummary.utils";

/** Genera alertas educativas desde patrones observados y no diagnósticos. */
export default function buildEducationalAlerts(
    settings: AppSettings | null,
    cycles: Cycle[],
    dailyLogs: DailyLog[],
    moodCheckIns: MoodCheckIn[],
    todayIso = toIsoDate(new Date()),
): EducationalAlert[] {
    const alerts: EducationalAlert[] = [];
    const observedRuns = getObservedPeriodRuns(dailyLogs);
    const observedStarts = getObservedCycleStarts(settings, cycles, observedRuns);
    const cycleLengths = getObservedCycleLengths(observedStarts);
    const heavyDays = dailyLogs.filter((log) => log.bleedingLevel === "heavy").length;
    const largeClotDays = dailyLogs.filter((log) => log.details?.clotSize === "large").length;
    const limitingPainDays = countLimitingPainDays(dailyLogs);
    const highPainMoments = moodCheckIns.filter((item) => item.pain >= 4).length;
    const noReliefDays = dailyLogs.filter((log) => log.details?.medicationRelief === "did_not_help").length;
    const longPeriods = observedRuns.filter((run) => run.length > 7);
    const outOfRangeCycles = cycleLengths.filter((days) => days < 21 || days > 35);
    const lastObservedStart = observedStarts[observedStarts.length - 1];
    const daysSinceLastObserved = lastObservedStart ? daysBetween(lastObservedStart, todayIso) : 0;

    if (longPeriods.length > 0) {
        const longest = Math.max(...longPeriods.map((run) => run.length));
        alerts.push({
            id: "long-period",
            severity: "consult",
            title: translate("cycle:alerts.longPeriod.title"),
            detail: translate("cycle:alerts.longPeriod.detail", { count: longest }),
        });
    }

    if (heavyDays >= 2 || largeClotDays >= 1) {
        alerts.push({
            id: "heavy-bleeding",
            severity: heavyDays >= 3 || largeClotDays >= 2 ? "consult" : "watch",
            title: translate("cycle:alerts.heavyBleeding.title"),
            detail: translate("cycle:alerts.heavyBleeding.detail"),
        });
    }

    if (limitingPainDays >= 2 || (highPainMoments >= 3 && noReliefDays >= 1)) {
        alerts.push({
            id: "pain-impact",
            severity: "consult",
            title: translate("cycle:alerts.painImpact.title"),
            detail: translate("cycle:alerts.painImpact.detail"),
        });
    }

    if (outOfRangeCycles.length >= 2) {
        alerts.push({
            id: "cycle-range",
            severity: "watch",
            title: translate("cycle:alerts.cycleRange.title"),
            detail: translate("cycle:alerts.cycleRange.detail"),
        });
    }

    if (lastObservedStart && daysSinceLastObserved > 90) {
        alerts.push({
            id: "long-gap",
            severity: "consult",
            title: translate("cycle:alerts.longGap.title"),
            detail: translate("cycle:alerts.longGap.detail"),
        });
    }

    return sortAlerts(alerts);
}

function sortAlerts(alerts: EducationalAlert[]) {
    const weight: Record<EducationalAlert["severity"], number> = {
        consult: 0,
        watch: 1,
        info: 2,
    };

    return [...alerts].sort((left, right) => weight[left.severity] - weight[right.severity]);
}
