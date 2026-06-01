import buildEducationalAlerts from "@/modules/cycle/alerts/buildEducationalAlerts";
import estimateCycle from "@/modules/cycle/estimation/estimateCycle";
import buildPatternInsights from "@/modules/cycle/insights/buildPatternInsights";
import { addDays } from "@/modules/cycle/utils/cycleDate.utils";
import { colors } from "@/theme";
import { Cycle, CycleSnapshot, PhaseKey } from "@/types/cycle.types";
import { EducationalAlert } from "@/types/insights.types";
import { DailyLog, MoodCheckIn } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";
import { WeekStripDay } from "@/ui/WeekStrip";
import { TodayAlertTone, TodayCareTip } from "../today.types";

export interface TodayHeroStat {
    icon: string;
    label: string;
    value: string;
}

/** Deriva tono breve para alertas visibles en Home. */
export function getAlertTone(severity: EducationalAlert["severity"]): TodayAlertTone {
    if (severity === "consult") {
        return { label: "Consultar", background: colors.periodSoft, ink: colors.period };
    }

    if (severity === "watch") {
        return { label: "Vigilar", background: colors.primarySoft, ink: colors.primaryDeep };
    }

    return { label: "Info", background: colors.surfaceSoft, ink: colors.muted };
}

/** Resume el nivel actual de base observada o estimada del snapshot. */
export function getHeroSupport(snapshot: CycleSnapshot, settings: AppSettings | null) {
    if (settings?.tryingToConceive && settings.hormonalContraception) {
        return "Búsqueda activa, pero con anticonceptivos hormonales la ventana probable queda en pausa y hoy manda lo observado.";
    }

    if (snapshot.source === "observed") {
        if (snapshot.activeSignals.length > 0) {
            return `Hoy manda lo observado: ${snapshot.activeSignals.join(" · ")}.`;
        }

        return `Hoy pesa más lo observado que el calendario. ${snapshot.confidenceReason}`;
    }

    if (snapshot.source === "estimated") {
        if (snapshot.phaseSource === "observed_signals") {
            return snapshot.confidenceReason;
        }

        return `${snapshot.phaseSourceLabel}. ${snapshot.confidenceReason}`;
    }

    return snapshot.confidenceReason;
}

/** Decide qué utilidad ocupa slot secundario del hero sin cambiar su diseño. */
export function getHeroSecondaryStat(snapshot: CycleSnapshot, settings: AppSettings | null): TodayHeroStat {
    if (settings?.tryingToConceive && settings.hormonalContraception) {
        return {
            icon: "compass-outline",
            label: "Objetivo",
            value: "Búsqueda en pausa",
        };
    }

    if (snapshot.fertilityVisible) {
        return {
            icon: "leaf",
            label: "Ventana fértil",
            value: snapshot.fertilityStatusLabel,
        };
    }

    if (snapshot.activeSignals.length > 0) {
        return {
            icon: "pulse",
            label: "Señal de hoy",
            value: snapshot.activeSignals[0] ?? snapshot.confidenceLabel,
        };
    }

    return {
        icon: "information-outline",
        label: "Confianza",
        value: snapshot.confidenceLabel,
    };
}

/** Construye páginas semanales alrededor de hoy para el carrusel del hero. */
export function buildWeekPages(
    settings: AppSettings | null,
    cycles: Cycle[],
    dailyLogs: DailyLog[],
    moodCheckIns: MoodCheckIn[],
    todayIso: string,
) {
    const phaseCache = new Map<string, PhaseKey>();

    return Array.from({ length: 15 }, (_, index) => {
        const focusIso = addDays(todayIso, (index - 7) * 7);
        return estimateCycle(settings, cycles, dailyLogs, focusIso, moodCheckIns).week.map((day): WeekStripDay => {
            const cachedPhase = phaseCache.get(day.iso);
            const phase = cachedPhase ?? estimateCycle(settings, cycles, dailyLogs, day.iso, moodCheckIns).phase;

            if (!cachedPhase) {
                phaseCache.set(day.iso, phase);
            }

            return {
                ...day,
                isToday: day.iso === todayIso,
                isFuture: day.iso > todayIso,
                phase,
            };
        });
    });
}

/** Devuelve sugerencias suaves del día según la fase actual. */
export function getCareTips(phase: PhaseKey): TodayCareTip[] {
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
                text: "Si el dolor cambia, déjalo marcado para compararlo luego.",
                color: colors.primaryDeep,
                background: colors.primarySoft,
            },
        ];
    }

    if (phase === "follicular") {
        return [
            {
                icon: "walk",
                text: "Si tienes energía, muévete un poco sin exigirte.",
                color: colors.success,
                background: colors.fertileSoft,
            },
            {
                icon: "notebook-heart-outline",
                text: "Anota sueño y ánimo; suelen dar pistas útiles.",
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
                text: "Temperatura, moco cervical o tests pueden darte más contexto.",
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
            text: "Observa ánimo y estrés sin juzgarte.",
            color: colors.period,
            background: colors.periodSoft,
        },
    ];
}

/** Devuelve insights y alertas resumidas de la pantalla Hoy. */
export function buildTodaySummaries(
    settings: AppSettings | null,
    cycles: Cycle[],
    dailyLogs: DailyLog[],
    moodCheckIns: MoodCheckIn[],
) {
    return {
        insights: buildPatternInsights(settings, cycles, dailyLogs, moodCheckIns),
        alerts: buildEducationalAlerts(settings, cycles, dailyLogs, moodCheckIns).slice(0, 2),
    };
}
