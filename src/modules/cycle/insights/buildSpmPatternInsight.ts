import { Cycle } from "../../../types/cycle.types";
import { PatternInsight } from "../../../types/insights.types";
import { DailyLog } from "../../../types/records.types";
import { AppSettings } from "../../../types/settings.types";

import estimateCycle from "../estimation/estimateCycle";
import { getObservedPeriodRuns } from "../shared/cycleObservedData.utils";
import { addDays, daysBetween, formatShortDate } from "../shared/cycleDate.utils";
import { average } from "../shared/cycleMath.utils";

/** Detecta patrón de inicio de SPM a partir de marcas reales. */
export default function buildSpmPatternInsight(
    settings: AppSettings | null,
    cycles: Cycle[],
    dailyLogs: DailyLog[],
    todayIso: string,
): PatternInsight | null {
    const observedRuns = [...getObservedPeriodRuns(dailyLogs)].sort((left, right) =>
        left.start.localeCompare(right.start),
    );
    if (observedRuns.length < 2) {
        return null;
    }

    const leadDays = dailyLogs
        .filter((log) => log.details?.pmsStarted)
        .map((log) => {
            const nextRun = observedRuns.find((run) => run.start > log.date);
            if (!nextRun) {
                return null;
            }

            const lead = daysBetween(log.date, nextRun.start);
            return lead >= 1 && lead <= 14 ? lead : null;
        })
        .filter((value): value is number => value !== null);

    if (leadDays.length < 2) {
        return null;
    }

    const averageLead = Math.round(average(leadDays));
    const snapshot = estimateCycle(settings, cycles, dailyLogs, todayIso);
    const approxStart = addDays(todayIso, snapshot.nextPeriodInDays - averageLead);
    const daysUntilApprox = daysBetween(todayIso, approxStart);
    const cycleLabel = `${leadDays.length} ciclos observados`;

    let timing = `Si próximo ciclo sigue parecido, podría asomar cerca del ${formatShortDate(approxStart)}.`;
    if (daysUntilApprox < -1) {
        timing = "Si próximo ciclo sigue parecido, este mes ya estarías dentro de esa ventana.";
    } else if (daysUntilApprox <= 1) {
        timing = "Si próximo ciclo sigue parecido, esa ventana cae por estos días.";
    }

    return {
        id: "spm-start",
        title: `Tu SPM suele arrancar ${averageLead} ${averageLead === 1 ? "día" : "días"} antes`,
        detail: `Lo marcaste así en ${cycleLabel}. ${timing}`,
        tone: "supportive",
    };
}
