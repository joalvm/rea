import { useEffect } from "react";
import { Linking } from "react-native";

import { useLastNotificationResponse } from "./lastNotificationResponse";

const DEFAULT_ACTION_IDENTIFIER = "expo.modules.notifications.actions.DEFAULT";

/**
 * Escucha el tap en una notificación local y abre su deep link
 * (`rea://checkin`, etc.). Expo Router recibe el evento de `Linking` y enruta
 * a la pantalla correspondiente.
 *
 * Funciona tanto si la app estaba en background (típico) como si arrancó por
 * cold-start desde la notificación: el hook ya expone la respuesta inicial en
 * el primer render.
 *
 * No renderiza nada; se monta en `app/_layout.tsx`.
 */
export function NotificationDeepLinkListener() {
    const lastNotificationResponse = useLastNotificationResponse();

    useEffect(() => {
        const response = lastNotificationResponse;
        if (!response) return;

        const url = response.notification.request.content.data?.url;
        const tapped = response.actionIdentifier === DEFAULT_ACTION_IDENTIFIER;
        if (!tapped || typeof url !== "string") return;

        Linking.openURL(url).catch(() => {
            // Si el link falla (ruta inexistente), no rompemos la app: el
            // usuario sigue en la pantalla donde estaba.
        });
    }, [lastNotificationResponse]);

    return null;
}
