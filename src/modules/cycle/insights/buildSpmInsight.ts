import { translate } from "@/modules/localization/i18n";
import { Cycle } from "@/types/cycle.types";
import { ObservedInsight } from "@/types/insights.types";
import { DailyLog } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";

import estimateCycle from "../estimation/estimateCycle";
import { getObservedPeriodRuns } from "../utils/cycleObservedData.utils";
import { addDays, daysBetween, formatShortDate } from "../utils/cycleDate.utils";
import { average } from "../utils/cycleMath.utils";

/** Detecta repetición de inicio de SPM a partir de marcas reales. */
export default function buildSpmInsight(
    settings: AppSettings | null,
    cycles: Cycle[],
    dailyLogs: DailyLog[],
    todayIso: string,
): ObservedInsight | null {
    const observedRuns = [...getObservedPeriodRuns(dailyLogs)].sort((left, right) =>
        left.start.localeCompare(right.start),
    );
    if (observedRuns.length < 2) {
        return null;
    }

    const leadDays = observedRuns
        .map((run) => findSpmLeadDaysForRun(dailyLogs, run.start))
        .filter((value): value is number => value !== null);

    if (leadDays.length < 2) {
        return null;
    }

    const averageLead = Math.round(average(leadDays));
    const snapshot = estimateCycle(settings, cycles, dailyLogs, todayIso);
    const approxStart = addDays(todayIso, snapshot.nextPeriodInDays - averageLead);
    const daysUntilApprox = daysBetween(todayIso, approxStart);
    const cycleLabel = translate("cycle:insights.spm.cycleLabel", { count: leadDays.length });

    let timing = translate("cycle:insights.spm.timingSpecific", { date: formatShortDate(approxStart) });
    if (daysUntilApprox < -1) {
        timing = translate("cycle:insights.spm.timingAlready");
    } else if (daysUntilApprox <= 1) {
        timing = translate("cycle:insights.spm.timingNear");
    }

    return {
        id: "spm-start",
        title: translate("cycle:insights.spm.title", { count: averageLead }),
        detail: translate("cycle:insights.spm.detail", { cycleLabel, timing }),
        tone: "supportive",
    };
}

function findSpmLeadDaysForRun(dailyLogs: DailyLog[], runStart: string) {
    const candidateLogs = dailyLogs
        .filter((log) => {
            const lead = daysBetween(log.date, runStart);
            return lead >= 1 && lead <= 14;
        })
        .sort((left, right) => left.date.localeCompare(right.date));

    const explicitStart = candidateLogs.find(
        (log) => log.details?.pmsState === "starting" || (!log.details?.pmsState && log.details?.pmsStarted),
    );
    if (explicitStart) {
        return daysBetween(explicitStart.date, runStart);
    }

    const presentFallback = candidateLogs.find((log) => log.details?.pmsState === "present");
    if (presentFallback) {
        return daysBetween(presentFallback.date, runStart);
    }

    return null;
}
