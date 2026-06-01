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
export function getHeroSupport(snapshot: CycleSnapshot) {
    if (snapshot.source === "observed") {
        return snapshot.confidence === "high"
            ? null
            : "Base actual: usando tus registros, pero aún puede ajustarse un poco.";
    }

    if (snapshot.source === "estimated") {
        if (snapshot.confidence === "low") {
            return "Base actual: estimación inicial. Se ajusta mejor cuando marques más periodos reales.";
        }

        if (snapshot.confidence === "medium") {
            return "Base actual: estimación provisional. Se afina con más registros.";
        }

        return "Base actual: estimación ya bastante alineada con tus registros recientes.";
    }

    return snapshot.confidenceNote ? `Base actual: ${snapshot.confidenceNote}` : null;
}

/** Construye páginas semanales alrededor de hoy para el carrusel del hero. */
export function buildWeekPages(settings: AppSettings | null, cycles: Cycle[], dailyLogs: DailyLog[], todayIso: string) {
    const phaseCache = new Map<string, PhaseKey>();

    return Array.from({ length: 15 }, (_, index) => {
        const focusIso = addDays(todayIso, (index - 7) * 7);
        return estimateCycle(settings, cycles, dailyLogs, focusIso).week.map((day): WeekStripDay => {
            const cachedPhase = phaseCache.get(day.iso);
            const phase = cachedPhase ?? estimateCycle(settings, cycles, dailyLogs, day.iso).phase;

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
                text: "La ventana es aproximada; mira también tus señales reales.",
                color: colors.success,
                background: colors.fertileSoft,
            },
            {
                icon: "thermometer-lines",
                text: "Si buscas precisión, temperatura o tests ayudan más.",
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
