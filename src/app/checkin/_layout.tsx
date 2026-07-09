import { Stack } from "expo-router";

/** Stack del wizard de check-in. Se presenta sobre las tabs como flujo enfocado. */
export default function CheckinLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                title: "Check-in",
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen name="index" options={{ title: "Check-in" }} />
            <Stack.Screen name="bleeding" options={{ title: "Sangrado" }} />
            <Stack.Screen name="feelings" options={{ title: "Ánimo" }} />
            <Stack.Screen name="body" options={{ title: "Cuerpo" }} />
            <Stack.Screen name="symptoms" options={{ title: "Síntomas" }} />
            <Stack.Screen name="fertility" options={{ title: "Fertilidad" }} />
            <Stack.Screen name="medications" options={{ title: "Medicamentos" }} />
            <Stack.Screen name="note" options={{ title: "Nota" }} />
            <Stack.Screen name="review" options={{ title: "Revisar" }} />
        </Stack>
    );
}
