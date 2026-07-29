import { isRunningInExpoGo } from "expo";

/** Decide si el runtime ofrece el módulo nativo completo de notificaciones. */
export function canUseLocalNotifications(): boolean {
    // Jest necesita ejecutar la lógica de programación con su scheduler mockeado.
    return process.env.JEST_WORKER_ID !== undefined || !isRunningInExpoGo();
}
