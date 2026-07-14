import { useRouter } from "expo-router";

import SettingsScreen from "@/features/settings/settings/SettingsScreen";

export default function SettingsRoute() {
    const router = useRouter();

    return (
        <SettingsScreen
            links={[
                {
                    label: "Mi contexto",
                    hint: "Ciclo, regularidad, anticoncepción, embarazo",
                    onPress: () => router.push("/settings/cycle-profile"),
                },
                { label: "Recordatorios", onPress: () => router.push("/settings/notifications") },
                { label: "Mis medicamentos", onPress: () => router.push("/settings/medications") },
                { label: "Modo embarazo", onPress: () => router.push("/settings/pregnancy") },
                {
                    label: "Privacidad",
                    hint: "Exportar, importar, borrar, bloqueo",
                    onPress: () => router.push("/settings/privacy"),
                },
                { label: "Fuentes revisadas", onPress: () => router.push("/settings/sources") },
                { label: "Acerca de Rea", onPress: () => router.push("/settings/about") },
                // Solo en desarrollo: siembra datos demo para verificación visual con Maestro.
                ...(typeof __DEV__ !== "undefined" && __DEV__
                    ? [
                          {
                              label: "Sembrar datos demo",
                              hint: "Restablece y carga datos de prueba",
                              testID: "dev-seed-trigger",
                              onPress: () => router.push("/dev/seed"),
                          },
                      ]
                    : []),
            ]}
        />
    );
}
