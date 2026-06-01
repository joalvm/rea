import { DailyLog } from "@/types/records.types";
import { labelSymptom } from "./symptomCatalog";

/** Resume síntomas más repetidos en conjunto de logs. */
export function summarizeTopSymptoms(logs: DailyLog[], limit = 5) {
    const counts = new Map<string, number>();
    logs.forEach((log) => {
        log.symptoms.forEach((symptom) => counts.set(symptom, (counts.get(symptom) ?? 0) + 1));
    });

    return [...counts.entries()]
        .sort((left, right) => right[1] - left[1])
        .slice(0, limit)
        .map(([key, count]) => ({ key, label: labelSymptom(key), count }));
}

/** Cuenta días donde dolor ya limitó rutina cotidiana. */
export function countLimitingPainDays(logs: DailyLog[]) {
    return logs.filter((log) => log.details?.painImpact === "limits_day" || log.details?.painImpact === "stops_day")
        .length;
}
