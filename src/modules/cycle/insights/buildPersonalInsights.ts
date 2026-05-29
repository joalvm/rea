import { DailyLog, MoodCheckIn } from "../../../types/records.types";

import { average } from "../shared/cycleMath.utils";

/** Construye insights simples desde registros recientes. */
export default function buildPersonalInsights(checkIns: MoodCheckIn[], dailyLogs: DailyLog[]): string[] {
    const insights: string[] = [];
    if (checkIns.length < 4) {
        return ["Con 4 registros empezamos a ver patrones propios, sin asumir causas hormonales."];
    }

    const avgPain = average(checkIns.map((item) => item.pain));
    const avgStress = average(checkIns.map((item) => item.stress));
    const avgEnergy = average(checkIns.map((item) => item.energy));

    if (avgPain >= 3.2) {
        insights.push("En tus registros recientes el dolor aparece por encima de lo habitual.");
    }

    if (avgStress >= 3.4) {
        insights.push("Parece que el estrés ha sido una señal frecuente en tus últimos momentos.");
    }

    if (avgEnergy <= 2.4) {
        insights.push("Suele aparecer energía baja en tus registros recientes.");
    }

    if (dailyLogs.some((log) => log.symptoms.includes("cólicos"))) {
        insights.push("Los cólicos aparecen en tu diario. Los iremos comparando con próximos ciclos.");
    }

    if (dailyLogs.some((log) => log.details?.painImpact === "limits_day" || log.details?.painImpact === "stops_day")) {
        insights.push("Hubo días en los que el dolor sí llegó a frenarte. Vale ver si se repite en la misma fase.");
    }

    if (dailyLogs.some((log) => log.details?.medicationRelief === "did_not_help")) {
        insights.push("En algunos días el alivio no fue suficiente. Puede ser útil compararlo con próximos ciclos.");
    }

    return insights.length > 0 ? insights : ["Tus registros se ven estables. Seguiremos observando cambios por fase."];
}
