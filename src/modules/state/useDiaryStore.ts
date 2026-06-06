import useAppStore from "./useAppStore";

/** Expone registros del diario desde Zustand; la UI no conoce servicios de storage. */
export default function useDiaryStore() {
    const checkInMoments = useAppStore((state) => state.data.checkInMoments);
    const dailyRecords = useAppStore((state) => state.data.dailyRecords);

    return {
        checkInMoments,
        dailyRecords,
        latestCheckIns: checkInMoments.slice(0, 12),
    };
}
