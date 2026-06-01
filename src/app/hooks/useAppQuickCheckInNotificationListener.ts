import { addNotificationResponseReceivedListener } from "expo-notifications/build/NotificationsEmitter";
import { useEffect } from "react";

import registerNotificationHandler from "../../modules/notifications/scheduler/registerNotificationHandler";
import { MomentType } from "../../types/records.types";

registerNotificationHandler();

/** Abre check-in rápido cuando usuaria responde desde una notificación local. */
export default function useAppQuickCheckInNotificationListener(
    openQuickCheckIn: (momentType?: MomentType, source?: "manual" | "notification" | "edit") => void,
) {
    useEffect(() => {
        const subscription = addNotificationResponseReceivedListener((response) => {
            const type = response.notification.request.content.data?.momentType;
            openQuickCheckIn(typeof type === "string" ? (type as MomentType) : "now", "notification");
        });

        return () => subscription.remove();
    }, [openQuickCheckIn]);
}
