import { DailyLog, MoodCheckIn } from "@/types/records.types";

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
    if (log.details?.pmsStarted) items.push("Empezó SPM");

    if (log.details?.painImpact === "noticeable") items.push("Dolor se notó");
    if (log.details?.painImpact === "limits_day") items.push("Dolor me limitó");
    if (log.details?.painImpact === "stops_day") items.push("Dolor me tumbó");

    if ((log.details?.breastSensitivity ?? 0) > 0) {
        items.push(`Sensibilidad mamaria ${log.details?.breastSensitivity}/5`);
    }

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
