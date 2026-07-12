import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

/** Stack del wizard de check-in. Se presenta sobre las tabs como flujo enfocado. */
export default function CheckinLayout() {
    const { t } = useTranslation("checkIn");

    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerShadowVisible: false,
                animation: "slide_from_right",
            }}
        >
            <Stack.Screen name="index" options={{ title: t("intro.title") }} />
            <Stack.Screen name="bleeding" options={{ title: t("steps.bleeding") }} />
            <Stack.Screen name="feelings" options={{ title: t("steps.feelings") }} />
            <Stack.Screen name="body" options={{ title: t("steps.body") }} />
            <Stack.Screen name="symptoms" options={{ title: t("steps.symptoms") }} />
            <Stack.Screen name="fertility" options={{ title: t("steps.fertility") }} />
            <Stack.Screen name="medications" options={{ title: t("steps.medications") }} />
            <Stack.Screen name="note" options={{ title: t("steps.note") }} />
            <Stack.Screen name="review" options={{ title: t("steps.review") }} />
        </Stack>
    );
}
