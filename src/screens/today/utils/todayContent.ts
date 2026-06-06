import buildEducationalAlerts from "@/modules/cycle/alerts/buildEducationalAlerts";
import estimateCycle from "@/modules/cycle/estimation/estimateCycle";
import buildObservedInsights from "@/modules/cycle/insights/buildObservedInsights";
import { addDays } from "@/modules/cycle/utils/cycleDate.utils";
import { translate } from "@/modules/localization/i18n";
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
        return { label: translate("common:alertTone.consult"), background: colors.periodSoft, ink: colors.period };
    }

    if (severity === "watch") {
        return { label: translate("common:alertTone.watch"), background: colors.primarySoft, ink: colors.primaryDeep };
    }

    return { label: translate("common:alertTone.info"), background: colors.surfaceSoft, ink: colors.muted };
}

/** Resume el nivel actual de base observada o estimada del snapshot. */
export function getHeroSupport(snapshot: CycleSnapshot, settings: AppSettings | null) {
    if (settings?.tryingToConceive && settings.hormonalContraception) {
        return translate("today:hero.pausedSupport");
    }

    if (snapshot.source === "observed") {
        if (snapshot.activeSignals.length > 0) {
            return translate("today:hero.activeObservedSignals", { signals: snapshot.activeSignals.join(" · ") });
        }

        return translate("today:hero.observedSupport", { confidenceReason: snapshot.confidenceReason });
    }

    if (snapshot.source === "estimated") {
        if (snapshot.phaseSource === "observed_signals") {
            return snapshot.confidenceReason;
        }

        return translate("today:hero.estimatedSupport", {
            confidenceReason: snapshot.confidenceReason,
            phaseSourceLabel: snapshot.phaseSourceLabel,
        });
    }

    return snapshot.confidenceReason;
}

/** Decide qué utilidad ocupa slot secundario del hero sin cambiar su diseño. */
export function getHeroSecondaryStat(snapshot: CycleSnapshot, settings: AppSettings | null): TodayHeroStat {
    if (settings?.tryingToConceive && settings.hormonalContraception) {
        return {
            icon: "compass-outline",
            label: translate("today:hero.pausedGoalLabel"),
            value: translate("today:hero.pausedGoalValue"),
        };
    }

    if (snapshot.fertilityVisible) {
        return {
            icon: "leaf",
            label: translate("terms:fertileWindow"),
            value: snapshot.fertilityStatusLabel,
        };
    }

    if (snapshot.activeSignals.length > 0) {
        return {
            icon: "pulse",
            label: translate("today:hero.todaySignalLabel"),
            value: snapshot.activeSignals[0] ?? snapshot.confidenceLabel,
        };
    }

    return {
        icon: "information-outline",
        label: translate("today:hero.confidenceLabel"),
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
                text: translate("today:care.menstrual.warmth"),
                color: colors.period,
                background: colors.periodSoft,
            },
            {
                icon: "pulse",
                text: translate("today:care.menstrual.painChange"),
                color: colors.primaryDeep,
                background: colors.primarySoft,
            },
        ];
    }

    if (phase === "follicular") {
        return [
            {
                icon: "walk",
                text: translate("today:care.follicular.movement"),
                color: colors.success,
                background: colors.fertileSoft,
            },
            {
                icon: "notebook-heart-outline",
                text: translate("today:care.follicular.trackSleepMood"),
                color: colors.primaryDeep,
                background: colors.primarySoft,
            },
        ];
    }

    if (phase === "fertile") {
        return [
            {
                icon: "leaf",
                text: translate("today:care.fertile.bodySigns"),
                color: colors.success,
                background: colors.fertileSoft,
            },
            {
                icon: "thermometer-lines",
                text: translate("today:care.fertile.temperature"),
                color: colors.primaryDeep,
                background: colors.primarySoft,
            },
        ];
    }

    return [
        {
            icon: "weather-night",
            text: translate("today:care.luteal.rest"),
            color: "#7A5EC9",
            background: colors.lutealSoft,
        },
        {
            icon: "heart-outline",
            text: translate("today:care.luteal.observeMoodStress"),
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
        insights: buildObservedInsights(settings, cycles, dailyLogs, moodCheckIns),
        alerts: buildEducationalAlerts(settings, cycles, dailyLogs, moodCheckIns).slice(0, 2),
    };
}
