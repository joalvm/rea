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
                <Stack.Screen
                    name="diary/[date]"
                    options={{
                        headerShown: true,
                        title: "Registro del día",
                    }}
                />
                <Stack.Screen name="+not-found" />
            </Stack>
        </DatabaseProvider>
    );
}
