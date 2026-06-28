import { Stack } from "expo-router";

/** Stack del grupo onboarding. Cabecera oculta (cada pantalla dibuja su chrome). */
export default function OnboardingLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen name="welcome" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="intent" />
            <Stack.Screen name="last-period" />
            <Stack.Screen name="cycle" />
            <Stack.Screen name="regularity" />
            <Stack.Screen name="contraception" />
            <Stack.Screen name="pregnancy-setup" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="complete" />
        </Stack>
    );
}
