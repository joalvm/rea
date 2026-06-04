import { useEffect } from "react";

import useNotificationStore from "@/modules/state/useNotificationStore";
import { MomentType } from "@/types/records.types";

/** Abre check-in rápido cuando usuaria responde desde una notificación local. */
export default function useAppQuickCheckInNotificationListener(
    openQuickCheckIn: (momentType?: MomentType, source?: "manual" | "notification" | "edit") => void,
) {
    const subscribeQuickCheckInResponses = useNotificationStore((state) => state.subscribeQuickCheckInResponses);

    useEffect(() => {
        return subscribeQuickCheckInResponses(openQuickCheckIn);
    }, [openQuickCheckIn, subscribeQuickCheckInResponses]);
}
