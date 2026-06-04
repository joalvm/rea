import { create } from "zustand";

import loadAppStoreData from "@/modules/storage/services/loadAppStoreData";
import { AppStoreData, initialAppStoreData } from "@/types/app.types";
import { NotificationCadence } from "@/types/notifications.types";

interface AppStoreState {
    data: AppStoreData;
    loading: boolean;
    bootstrap: () => Promise<void>;
    refreshData: () => Promise<void>;
    replaceNotificationCadence: (notificationCadence: NotificationCadence) => void;
    resetData: () => void;
}

/** Store raiz para bootstrap y snapshot local de Rea; no persiste tablas ni reemplaza SQLite. */
const useAppStore = create<AppStoreState>((set) => ({
    data: initialAppStoreData,
    loading: true,
    bootstrap: async () => {
        set({ loading: true });
        const data = await loadAppStoreData();
        set({ data, loading: false });
    },
    refreshData: async () => {
        const data = await loadAppStoreData();
        set({ data, loading: false });
    },
    replaceNotificationCadence: (notificationCadence) => {
        set((current) => ({
            data: {
                ...current.data,
                notificationCadence,
            },
        }));
    },
    resetData: () => {
        set({ data: initialAppStoreData, loading: false });
    },
}));

export default useAppStore;
