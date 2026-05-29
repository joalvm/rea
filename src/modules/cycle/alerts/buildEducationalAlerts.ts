import { Cycle } from "@/types/cycle.types";
import { EducationalAlert } from "@/types/insights.types";
import { DailyLog, MoodCheckIn } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";

import {
    getObservedCycleLengths,
    getObservedCycleStarts,
    getObservedPeriodRuns,
} from "../shared/cycleObservedData.utils";
import { daysBetween, toIsoDate } from "../shared/cycleDate.utils";
import { countLimitingPainDays } from "../shared/cycleSummary.utils";

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
            title: "Sangrado más largo de lo habitual",
            detail: `Ya registraste un periodo de ${longest} días. Si vuelve a pasar, conviene comentarlo con profesional.`,
        });
    }

    if (heavyDays >= 2 || largeClotDays >= 1) {
        alerts.push({
            id: "heavy-bleeding",
            severity: heavyDays >= 3 || largeClotDays >= 2 ? "consult" : "watch",
            title: "Flujo abundante para vigilar",
            detail: "Hay registros de sangrado abundante o coágulos grandes. Si se repite o te empapa muy rápido, conviene consultar.",
        });
    }

    if (limitingPainDays >= 2 || (highPainMoments >= 3 && noReliefDays >= 1)) {
        alerts.push({
            id: "pain-impact",
            severity: "consult",
            title: "Dolor que ya impacta tu rutina",
            detail: "Registraste días en los que dolor te limitó o no respondió bien. Si sigue así, vale hablarlo con profesional.",
        });
    }

    if (outOfRangeCycles.length >= 2) {
        alerts.push({
            id: "cycle-range",
            severity: "watch",
            title: "Ciclos fuera de rango típico",
            detail: "Tus ciclos observados no siempre caen entre 21 y 35 días. Sin diagnosticar nada, es buena señal para seguir mirando o consultar si persiste.",
        });
    }

    if (lastObservedStart && daysSinceLastObserved > 90) {
        alerts.push({
            id: "long-gap",
            severity: "consult",
            title: "Mucho tiempo sin periodo observado",
            detail: "Pasaron más de 90 días desde último inicio observado. Si no hay una explicación clara, conviene consultarlo.",
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
