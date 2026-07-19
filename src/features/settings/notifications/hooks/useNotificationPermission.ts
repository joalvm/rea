import { useEffect, useState } from "react";

import { getNotificationPermission, requestNotificationPermission } from "@/modules/notifications";

/**
 * Estado del permiso de notificaciones, refrescado al montar y tras cada
 * re-intento. Lo lee sin pedir (sin disparar el diálogo del sistema) salvo que
 * se llame a `request()` explícitamente.
 */
export function useNotificationPermission() {
    const [granted, setGranted] = useState<boolean | null>(null);

    useEffect(() => {
        let active = true;
        getNotificationPermission()
            .then((value) => {
                if (active) setGranted(value);
            })
            .catch(() => {
                if (active) setGranted(false);
            });
        return () => {
            active = false;
        };
    }, []);

    async function request() {
        const value = await requestNotificationPermission();
        setGranted(value);
        return value;
    }

    return { granted, request };
}
