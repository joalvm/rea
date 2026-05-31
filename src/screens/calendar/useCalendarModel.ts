import { useCallback, useMemo, useState } from "react";

import generateMonthDays from "@/modules/cycle/calendar/generateMonthDays";
import { monthTitle, toIsoDate } from "@/modules/cycle/shared/cycleDate.utils";
import { Cycle } from "@/types/cycle.types";
import { DailyLog } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";

interface UseCalendarModelParams {
    settings: AppSettings | null;
    cycles: Cycle[];
    dailyLogs: DailyLog[];
}

/** Encapsula mes activo y derivados que alimentan la lectura del calendario. */
export default function useCalendarModel({ settings, cycles, dailyLogs }: UseCalendarModelParams) {
    const [month, setMonth] = useState(() => new Date());
    const todayIso = useMemo(() => toIsoDate(new Date()), []);

    const days = useMemo(
        () => generateMonthDays(month, settings, cycles, dailyLogs),
        [cycles, dailyLogs, month, settings],
    );
    const loggedDates = useMemo(() => new Set(dailyLogs.map((log) => log.date)), [dailyLogs]);
    const monthLabel = useMemo(() => monthTitle(month), [month]);
    const todayHasLog = loggedDates.has(todayIso);

    const shiftMonth = useCallback((delta: number) => {
        setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1, 12));
    }, []);

    return {
        days,
        loggedDates,
        monthLabel,
        shiftMonth,
        todayHasLog,
        todayIso,
    };
}
