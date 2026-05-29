import { Cycle, CycleSummary } from "../../../types/cycle.types";
import { DailyLog } from "../../../types/records.types";
import { AppSettings } from "../../../types/settings.types";

import { getObservedPeriodRuns } from "../shared/cycleObservedData.utils";
import { daysBetween } from "../shared/cycleDate.utils";
import { countLimitingPainDays, summarizeTopSymptoms } from "../shared/cycleSummary.utils";

/** Resume últimos ciclos observados para vista de patrones. */
export default function buildCycleSummaries(
    _settings: AppSettings | null,
    _cycles: Cycle[],
    dailyLogs: DailyLog[],
    limit = 6,
): CycleSummary[] {
    const observedRuns = [...getObservedPeriodRuns(dailyLogs)].sort((left, right) =>
        right.start.localeCompare(left.start),
    );
    const allLogs = [...dailyLogs];

    return observedRuns.slice(0, limit).map((run, index) => {
        const olderRun = observedRuns[index + 1];
        const logsInRun = allLogs.filter((log) => log.date >= run.start && log.date <= run.end);
        const topSymptoms = summarizeTopSymptoms(logsInRun, 2).map((item) => item.label);

        return {
            id: `${run.start}-${index}`,
            startDate: run.start,
            endDate: run.end,
            source: "observed",
            cycleLengthDays: olderRun ? daysBetween(olderRun.start, run.start) : null,
            bleedingDays: run.length,
            heavyDays: logsInRun.filter((log) => log.bleedingLevel === "heavy").length,
            painImpactDays: countLimitingPainDays(logsInRun),
            topSymptoms,
        };
    });
}
