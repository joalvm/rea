import useAppStore from "./useAppStore";

/** Expone datos de calendario desde Zustand sin llamar almacenamiento en pantalla. */
export default function useCalendarStore() {
    const settings = useAppStore((state) => state.data.settings);
    const periodHistory = useAppStore((state) => state.data.periodHistory);
    const dailyRecords = useAppStore((state) => state.data.dailyRecords);

    return {
        dailyRecords,
        periodHistory,
        settings,
    };
}
