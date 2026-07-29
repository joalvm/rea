import Constants from "expo-constants";

/** Decide si el runtime ofrece el módulo nativo completo de notificaciones. */
export function canUseLocalNotifications(): boolean {
    // Jest necesita ejecutar la lógica de programación con su scheduler mockeado.
    const isRunningInJest = typeof process !== "undefined" && process.env.JEST_WORKER_ID !== undefined;

    // `isRunningInExpoGo` no está expuesto de forma estable por el entrypoint
    // `expo` en todos los bundles Hermes. `appOwnership` sí forma parte del
    // contrato de expo-constants y permite evitar Expo Go sin una llamada
    // potencialmente inexistente.
    return isRunningInJest || Constants.appOwnership !== "expo";
}
