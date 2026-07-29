import * as LocalAuthentication from "expo-local-authentication";

/** Solicita biometría o código del dispositivo cuando la plataforma lo admite. */
export async function authenticateDevice(): Promise<boolean> {
    const hardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = hardware && (await LocalAuthentication.isEnrolledAsync());
    if (!enrolled) return false;
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: "Desbloquear Rea" });
    return result.success;
}
