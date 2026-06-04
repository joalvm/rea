import { useMemo } from "react";

import estimateCycle from "@/modules/cycle/estimation/estimateCycle";
import { toIsoDate } from "@/modules/cycle/utils/cycleDate.utils";

import useAppStore from "./useAppStore";

/** Expone modelo de día seleccionado desde Zustand, sin repositorios en screen. */
export default function useDayDetailStore(selectedIso: string) {
    const settings = useAppStore((state) => state.data.settings);
    const periodHistory = useAppStore((state) => state.data.periodHistory);
    const checkInMoments = useAppStore((state) => state.data.checkInMoments);
    const dailyRecords = useAppStore((state) => state.data.dailyRecords);

    const snapshot = useMemo(
        () => estimateCycle(settings, periodHistory, dailyRecords, selectedIso, checkInMoments),
        [checkInMoments, dailyRecords, periodHistory, selectedIso, settings],
    );
    const dailyRecord = useMemo(
        () => dailyRecords.find((entry) => entry.date === selectedIso) ?? null,
        [dailyRecords, selectedIso],
    );
    const moments = useMemo(
        () =>
            checkInMoments
                .filter((entry) => toIsoDate(new Date(entry.datetime)) === selectedIso)
                .sort((left, right) => right.datetime.localeCompare(left.datetime)),
        [checkInMoments, selectedIso],
    );

    return {
        dailyRecord,
        moments,
        snapshot,
    };
}
