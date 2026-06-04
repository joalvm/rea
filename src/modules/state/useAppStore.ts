import { create } from "zustand";

import loadAppData from "@/modules/storage/services/loadAppData";
import { AppData, initialAppData } from "@/types/app.types";
import { NotificationCadence } from "@/types/notifications.types";

interface AppStoreState {
    data: AppData;
    loading: boolean;
    bootstrap: () => Promise<void>;
    refreshData: () => Promise<void>;
    replaceNotificationCadence: (notificationCadence: NotificationCadence) => void;
    resetData: () => void;
}

/** Store raiz para bootstrap y snapshot local de Rea; no persiste tablas ni reemplaza SQLite. */
const useAppStore = create<AppStoreState>((set) => ({
    data: initialAppData,
    loading: true,
    bootstrap: async () => {
        set({ loading: true });
        const data = await loadAppData();
        set({ data, loading: false });
    },
    refreshData: async () => {
        const data = await loadAppData();
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
        set({ data: initialAppData, loading: false });
    },
}));

export default useAppStore;
