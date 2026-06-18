import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { DatabaseProvider } from "@/db/DatabaseProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { useTheme } from "@/theme/useTheme";

/**
 * Navegador raíz. Vive bajo `ThemeProvider`, así que puede leer el tema para
 * pintar la status bar y el fondo de las pantallas de forma coherente. Los
 * colores de headers/tab bar los aplica automáticamente el tema de navegación
 * que inyecta `ThemeProvider`.
 */
function RootNavigator() {
    const theme = useTheme();

    return (
        <>
            <StatusBar style={theme.mode === "dark" ? "light" : "dark"} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: theme.colors.background },
                }}
            >
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
        </>
    );
}

export default function RootLayout() {
    return (
        <ThemeProvider>
            <DatabaseProvider>
                <RootNavigator />
            </DatabaseProvider>
        </ThemeProvider>
    );
}
