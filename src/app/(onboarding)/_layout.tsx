import { Stack } from "expo-router";

export default function OnboardingLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen name="welcome" />
            <Stack.Screen name="import" />
            <Stack.Screen name="birth-year" />
            <Stack.Screen name="last-period" />
            <Stack.Screen name="cycle" />
            <Stack.Screen name="regularity" />
            <Stack.Screen name="contraception" />
            <Stack.Screen name="goal" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="complete" />
        </Stack>
    );
}
