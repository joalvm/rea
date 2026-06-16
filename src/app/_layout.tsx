import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { DatabaseProvider } from "@/db/DatabaseProvider";

export default function RootLayout() {
    return (
        <DatabaseProvider>
            <StatusBar style="auto" hidden={false} />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(onboarding)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="checkin" />
                <Stack.Screen name="diary/[date]" options={{ headerShown: true, title: "Registro del día" }} />
                <Stack.Screen name="period/edit" options={{ headerShown: true, title: "Editar periodo" }} />
                <Stack.Screen name="period/confirm" options={{ headerShown: true, title: "Confirmar periodo" }} />
                <Stack.Screen name="content/[id]" options={{ headerShown: true, title: "Contenido" }} />
                <Stack.Screen name="settings/cycle-profile" options={{ headerShown: true, title: "Mi contexto" }} />
                <Stack.Screen name="settings/notifications" options={{ headerShown: true, title: "Recordatorios" }} />
                <Stack.Screen name="settings/medications" options={{ headerShown: true, title: "Mis medicamentos" }} />
                <Stack.Screen name="settings/privacy" options={{ headerShown: true, title: "Privacidad" }} />
                <Stack.Screen name="settings/pregnancy" options={{ headerShown: true, title: "Modo embarazo" }} />
                <Stack.Screen name="settings/sources" options={{ headerShown: true, title: "Fuentes revisadas" }} />
                <Stack.Screen name="settings/about" options={{ headerShown: true, title: "Acerca de Rea" }} />
                <Stack.Screen name="+not-found" />
            </Stack>
        </DatabaseProvider>
    );
}
