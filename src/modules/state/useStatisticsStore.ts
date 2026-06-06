import useAppStore from "./useAppStore";

/** Expone base observada para Estadísticas desde Zustand, no desde storage directo. */
export default function useStatisticsStore() {
    const settings = useAppStore((state) => state.data.settings);
    const periodHistory = useAppStore((state) => state.data.periodHistory);
    const checkInMoments = useAppStore((state) => state.data.checkInMoments);
    const dailyRecords = useAppStore((state) => state.data.dailyRecords);

    return {
        checkInMoments,
        dailyRecords,
        periodHistory,
        settings,
    };
}
