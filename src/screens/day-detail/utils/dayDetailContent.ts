import { parseIsoDate } from "@/modules/cycle/utils/cycleDate.utils";
import { colors } from "@/theme";
import { PhaseKey } from "@/types/cycle.types";
import { DailyLog, MoodCheckIn } from "@/types/records.types";
import { DayDetailCareTip } from "../day-detail.types";

/** Resume el día seleccionado según registros y contexto temporal. */
export function buildDaySummary(
    selectedIso: string,
    todayIso: string,
    phaseMessage: string,
    dailyLog: DailyLog | null,
    moments: MoodCheckIn[],
) {
    if (dailyLog) {
        const symptomCopy =
            dailyLog.symptoms.length > 0
                ? `Síntomas marcados: ${dailyLog.symptoms.slice(0, 3).join(", ")}.`
                : "Sin síntomas anotados.";
        const noteCopy = dailyLog.notes ? ` Nota: ${dailyLog.notes}` : "";
        return `Día observado. ${symptomCopy}${noteCopy}`.trim();
    }

    if (moments.length > 0) {
        const latest = moments[0];
        if (!latest) {
            return "Hay momentos guardados para este día.";
        }

        return `Hay ${moments.length} ${moments.length === 1 ? "momento" : "momentos"} guardados. Último ánimo ${latest.mood}/5 y dolor ${latest.pain}/5.`;
    }

    if (selectedIso > todayIso) {
        return "Aún no hay anotación. Puedes usar esta vista para ubicarte dentro del mes y volver si algo cambia.";
    }

    if (selectedIso === todayIso) {
        return "Hoy todavía no tiene registro completo. Esta vista sirve como contexto antes de anotar.";
    }

    return "No quedó registro ese día.";
}

/** Resume detalles opcionales del log diario en chips legibles. */
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

/** Traduce el sangrado a una etiqueta corta para detalle diario. */
export function bleedingLabel(level: DailyLog["bleedingLevel"]) {
    if (level === "none") return "Sin sangrado";
    if (level === "spotting") return "Manchado";
    if (level === "light") return "Flujo leve";
    if (level === "medium") return "Flujo medio";
    return "Flujo abundante";
}

/** Traduce la procedencia del dato diario. */
export function sourceLabel(source: DailyLog["source"]) {
    if (source === "estimated") return "Estimado";
    if (source === "unknown") return "Sin datos";
    return "Observado";
}

/** Devuelve el título legible de un momento guardado. */
export function momentLabel(momentType: MoodCheckIn["momentType"]) {
    if (momentType === "morning") return "Cómo despertaste";
    if (momentType === "night") return "Cómo estuvo tu día";
    return "Cómo te sientes ahora";
}

/** Formatea fecha larga del día seleccionado. */
export function formatLongDate(iso: string) {
    const date = parseIsoDate(iso);
    const label = date.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
    return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Devuelve consejos suaves contextualizados por fase. */
export function getCareTips(phase: PhaseKey): DayDetailCareTip[] {
    if (phase === "menstrual") {
        return [
            {
                icon: "tea-outline",
                text: "Calor suave, agua cerca y descanso sin culpa.",
                color: colors.period,
                background: colors.periodSoft,
            },
            {
                icon: "pulse",
                text: "Si dolor cambia, conviene dejarlo anotado para comparar luego.",
                color: colors.primaryDeep,
                background: colors.primarySoft,
            },
        ];
    }

    if (phase === "follicular") {
        return [
            {
                icon: "walk",
                text: "Si energía acompaña, algo de movimiento suave suele sentar bien.",
                color: colors.success,
                background: colors.fertileSoft,
            },
            {
                icon: "notebook-heart-outline",
                text: "Sueño y ánimo aquí suelen dar contexto útil para resto de ciclo.",
                color: colors.primaryDeep,
                background: colors.primarySoft,
            },
        ];
    }

    if (phase === "fertile") {
        return [
            {
                icon: "leaf",
                text: "Si este momento te importa, mira también las señales de tu cuerpo.",
                color: colors.success,
                background: colors.fertileSoft,
            },
            {
                icon: "thermometer-lines",
                text: "Temperatura o tests pueden darte más contexto.",
                color: colors.primaryDeep,
                background: colors.primarySoft,
            },
        ];
    }

    return [
        {
            icon: "weather-night",
            text: "Prioriza sueño, comida tranquila y pausas pequeñas.",
            color: "#7A5EC9",
            background: colors.lutealSoft,
        },
        {
            icon: "heart-outline",
            text: "Ánimo y estrés aquí suelen merecer seguimiento suave, sin juicio.",
            color: colors.period,
            background: colors.periodSoft,
        },
    ];
}
