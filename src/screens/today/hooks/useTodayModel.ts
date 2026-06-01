import { useMemo } from "react";

import { toIsoDate } from "@/modules/cycle/utils/cycleDate.utils";
import { Cycle, CycleSnapshot } from "@/types/cycle.types";
import { DailyLog, MoodCheckIn } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";
import {
    buildTodaySummaries,
    buildWeekPages,
    getCareTips,
    getHeroSecondaryStat,
    getHeroSupport,
} from "../utils/todayContent";
import getHeroTheme from "../utils/todayHeroTheme";

interface UseTodayModelParams {
    settings: AppSettings | null;
    cycles: Cycle[];
    snapshot: CycleSnapshot;
    moodCheckIns: MoodCheckIn[];
    dailyLogs: DailyLog[];
}

/** Agrupa derivados editoriales y de lectura que usa la pantalla de hoy. */
export default function useTodayModel({ settings, cycles, snapshot, moodCheckIns, dailyLogs }: UseTodayModelParams) {
    const heroTheme = useMemo(() => getHeroTheme(snapshot.phase), [snapshot.phase]);
    const { insights, alerts } = useMemo(
        () => buildTodaySummaries(settings, cycles, dailyLogs, moodCheckIns),
        [cycles, dailyLogs, moodCheckIns, settings],
    );
    const careTips = useMemo(() => getCareTips(snapshot.phase), [snapshot.phase]);
    const heroSecondaryStat = useMemo(() => getHeroSecondaryStat(snapshot, settings), [settings, snapshot]);
    const heroSupport = useMemo(() => getHeroSupport(snapshot, settings), [settings, snapshot]);
    const showHeroDataSummary = snapshot.observedCycleCount > 0;
    const todayIso = useMemo(
        () => snapshot.week.find((day) => day.isToday)?.iso ?? toIsoDate(new Date()),
        [snapshot.week],
    );
    const weekPages = useMemo(
        () => buildWeekPages(settings, cycles, dailyLogs, moodCheckIns, todayIso),
        [cycles, dailyLogs, moodCheckIns, settings, todayIso],
    );

    return {
        alerts,
        careTips,
        heroSecondaryStat,
        heroSupport,
        heroTheme,
        insights,
        showHeroDataSummary,
        weekPages,
    };
}
