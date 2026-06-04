import { create } from "zustand";

import selectEditorialContent from "@/modules/content/selectEditorialContent";
import { EditorialContentCard, EditorialContentContext } from "@/types/content.types";

interface ContentStoreState {
    statisticsCards: EditorialContentCard[];
    loadingStatisticsCards: boolean;
    loadStatisticsCards: (context: EditorialContentContext) => Promise<void>;
    resetContent: () => void;
}

/** Store de contenido editorial local; orquesta selección SQLite sin API ni persistencia Zustand. */
const useContentStore = create<ContentStoreState>((set) => ({
    statisticsCards: [],
    loadingStatisticsCards: false,
    loadStatisticsCards: async (context) => {
        set({ loadingStatisticsCards: true });
        try {
            const statisticsCards = await selectEditorialContent(context);
            set({ loadingStatisticsCards: false, statisticsCards });
        } catch {
            set({ loadingStatisticsCards: false, statisticsCards: [] });
        }
    },
    resetContent: () => {
        set({ loadingStatisticsCards: false, statisticsCards: [] });
    },
}));

export default useContentStore;
