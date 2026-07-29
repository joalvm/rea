import { useEffect } from "react";

import { setForegroundHandler } from "./foregroundHandler";

/**
 * Monta el handler de notificaciones en primer plano: define cómo se
 * presentan las notificaciones que llegan mientras la app está abierta.
 *
 * Discreto por defecto: banner visible, sin sonido y sin badge. El usuario ya
 * está en la app; el sonido sería ruido. El contenido (discreto o explícito)
 * lo decide `buildContent` al programar, no aquí.
 *
 * Este componente no renderiza nada: solo registra el handler en el montaje.
 * Vive en `app/_layout.tsx` para estar activo desde el arranque.
 */
export function NotificationHandler() {
    useEffect(() => {
        const teardown = setForegroundHandler();
        return teardown;
    }, []);

    return null;
}
