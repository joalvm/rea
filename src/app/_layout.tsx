import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Quicksand_600SemiBold, Quicksand_700Bold } from "@expo-google-fonts/quicksand";
import {
    NunitoSans_400Regular,
    NunitoSans_500Medium,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
} from "@expo-google-fonts/nunito-sans";

import { DatabaseProvider } from "@/db/DatabaseProvider";
import { Snackbar } from "@/components/snackbar/Snackbar";
import { NotificationDeepLinkListener, NotificationHandler, useNotificationsBootstrap } from "@/modules/notifications";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { useTheme } from "@/theme/useTheme";

// Inicializa i18next (efecto de importación, una sola vez). Debe ir antes de que
// cualquier pantalla use `useTranslation`.
import "@/modules/i18n/i18n";

// Mantiene el splash visible hasta que las fuentes de marca estén listas (evita el
// "flash" de fuente de sistema antes de que cargue Quicksand / Nunito Sans).
SplashScreen.preventAutoHideAsync();

/**
 * Navegador raíz. Vive bajo `ThemeProvider`, así que puede leer el tema para
 * pintar la status bar y el fondo de las pantallas de forma coherente. Los
 * colores de headers/tab bar los aplica automáticamente el tema de navegación
 * que inyecta `ThemeProvider`.
 */
function RootNavigator() {
    const theme = useTheme();
    useNotificationsBootstrap();

    return (
        <>
            <NotificationHandler />
            <NotificationDeepLinkListener />
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
                <Stack.Screen name="period/edit/[id]" options={{ headerShown: true, title: "Editar regla" }} />
                <Stack.Screen name="period/confirm" options={{ headerShown: true, title: "Confirmar periodo" }} />
                <Stack.Screen name="content/[id]" options={{ headerShown: true, title: "Contenido" }} />
                <Stack.Screen name="settings/cycle-profile" options={{ headerShown: true, title: "Mi contexto" }} />
                <Stack.Screen name="settings/notifications" options={{ headerShown: true, title: "Recordatorios" }} />
                <Stack.Screen name="settings/medications" options={{ headerShown: true, title: "Mis medicamentos" }} />
                <Stack.Screen name="settings/privacy" options={{ headerShown: true, title: "Privacidad" }} />
                <Stack.Screen name="settings/pregnancy" options={{ headerShown: true, title: "Modo embarazo" }} />
                <Stack.Screen name="settings/sources" options={{ headerShown: true, title: "Fuentes revisadas" }} />
                <Stack.Screen name="settings/about" options={{ headerShown: true, title: "Acerca de Rea" }} />
                <Stack.Screen name="dev/seed" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
            </Stack>
            <Snackbar />
        </>
    );
}

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({
        Quicksand_600SemiBold,
        Quicksand_700Bold,
        NunitoSans_400Regular,
        NunitoSans_500Medium,
        NunitoSans_600SemiBold,
        NunitoSans_700Bold,
    });

    useEffect(() => {
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    // No renderizamos la app hasta resolver las fuentes (cargadas o con error). El
    // splash sigue visible mientras tanto.
    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <ThemeProvider>
            <DatabaseProvider>
                <RootNavigator />
            </DatabaseProvider>
        </ThemeProvider>
    );
}
