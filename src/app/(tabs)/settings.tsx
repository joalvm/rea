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
            ]}
        />
    );
}
