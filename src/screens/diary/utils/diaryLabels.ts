import { DailyLog, MoodCheckIn } from "@/types/records.types";
import { labelSymptom } from "@/modules/cycle/utils/symptomCatalog";

/** Devuelve icono del momento registrado. */
export function momentIcon(momentType: MoodCheckIn["momentType"]) {
    if (momentType === "morning") return "weather-sunset-up";
    if (momentType === "night") return "weather-night";
    return "clock-outline";
}

/** Devuelve título legible del momento registrado. */
export function momentLabel(momentType: MoodCheckIn["momentType"]) {
    if (momentType === "morning") return "Cómo despertaste";
    if (momentType === "night") return "Cómo estuvo tu día";
    return "Cómo te sientes ahora";
}

/** Traduce el sangrado observado a una etiqueta breve. */
export function bleedingLabel(level: DailyLog["bleedingLevel"]) {
    if (level === "none") return "Sin sangrado";
    if (level === "spotting") return "Manchado";
    if (level === "light") return "Leve";
    if (level === "medium") return "Medio";
    return "Abundante";
}

/** Traduce la fuente del día a una etiqueta visible. */
export function sourceLabel(source: DailyLog["source"]) {
    if (source === "estimated") return "Estimado";
    if (source === "unknown") return "Sin datos";
    return "Observado";
}

/** Resume detalles opcionales del registro diario en chips legibles. */
export function buildDailyLogDetails(log: DailyLog) {
    const items: string[] = [];

    if (log.details?.periodStarted) items.push("Empezó hoy");
    if (log.details?.periodEnded) items.push("Terminó hoy");
    if (log.details?.pmsState === "starting") items.push("SPM empezando");
    if (log.details?.pmsState === "present") items.push("SPM presente");
    if (!log.details?.pmsState && log.details?.pmsStarted) items.push("Empezó SPM");

    if (log.details?.painImpact === "noticeable") items.push("Dolor se notó");
    if (log.details?.painImpact === "limits_day") items.push("Dolor me limitó");
    if (log.details?.painImpact === "stops_day") items.push("Dolor me tumbó");

    if ((log.details?.breastSensitivity ?? 0) > 0) {
        items.push(`Sensibilidad mamaria ${log.details?.breastSensitivity}/5`);
    }

    if (log.details?.painLocations && log.details.painLocations.length > 0) {
        items.push(`Dolor en ${log.details.painLocations.join(", ")}`);
    }

    if (log.details?.libidoLevel === "very_low") items.push("Libido muy baja");
    if (log.details?.libidoLevel === "low") items.push("Libido baja");
    if (log.details?.libidoLevel === "high") items.push("Libido alta");

    if (log.details?.medicationName) {
        items.push(log.details.medicationName);
    }

    if (log.details?.medicationRelief === "helped") items.push("Sí ayudó");
    if (log.details?.medicationRelief === "partly_helped") items.push("Ayudó poco");
    if (log.details?.medicationRelief === "did_not_help") items.push("No ayudó");

    if (log.details?.clotSize === "small") items.push("Coágulos leves");
    if (log.details?.clotSize === "medium") items.push("Coágulos medios");
    if (log.details?.clotSize === "large") items.push("Coágulos grandes");

    return items;
}

/** Traduce síntomas guardados a etiquetas visibles. */
export function symptomLabel(symptom: DailyLog["symptoms"][number]) {
    return labelSymptom(symptom);
}
