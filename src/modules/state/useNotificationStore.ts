import { addNotificationResponseReceivedListener } from "expo-notifications/build/NotificationsEmitter";
import { create } from "zustand";

import registerNotificationHandler from "@/modules/notifications/scheduler/registerNotificationHandler";
import { MomentType } from "@/types/records.types";

interface NotificationStoreState {
    subscribeQuickCheckInResponses: (
        openQuickCheckIn: (momentType?: MomentType, source?: "manual" | "notification" | "edit") => void,
    ) => () => void;
}

/** Store de integracion con notificaciones locales; app hooks solo consumen este contrato. */
const useNotificationStore = create<NotificationStoreState>(() => ({
    subscribeQuickCheckInResponses: (openQuickCheckIn) => {
        registerNotificationHandler();

        const subscription = addNotificationResponseReceivedListener((response) => {
            const type = response.notification.request.content.data?.momentType;
            openQuickCheckIn(typeof type === "string" ? (type as MomentType) : "now", "notification");
        });

        return () => subscription.remove();
    },
}));

export default useNotificationStore;
