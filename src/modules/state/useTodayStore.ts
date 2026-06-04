import { useMemo } from "react";

import estimateCycle from "@/modules/cycle/estimation/estimateCycle";

import useAppStore from "./useAppStore";

/** Expone datos de Hoy desde Zustand sin acceso directo a SQLite desde UI. */
export default function useTodayStore() {
    const settings = useAppStore((state) => state.data.settings);
    const periodHistory = useAppStore((state) => state.data.periodHistory);
    const checkInMoments = useAppStore((state) => state.data.checkInMoments);
    const dailyRecords = useAppStore((state) => state.data.dailyRecords);

    const snapshot = useMemo(
        () => estimateCycle(settings, periodHistory, dailyRecords, undefined, checkInMoments),
        [checkInMoments, dailyRecords, periodHistory, settings],
    );

    return {
        checkInMoments,
        dailyRecords,
        periodHistory,
        settings,
        snapshot,
    };
}
