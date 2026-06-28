import { Redirect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useState } from "react";
import { View } from "react-native";

type GateState = "loading" | "onboarding" | "ready";

/**
 * Gate de arranque: decide entre onboarding y la app principal leyendo si existe
 * un `app_settings` con `onboarding_completed_at`. Ante error o ausencia de datos
 * asume onboarding (camino seguro para instalaciones nuevas).
 */
export default function Index() {
    const db = useSQLiteContext();
    const [state, setState] = useState<GateState>("loading");

    useEffect(() => {
        let active = true;

        db.getFirstAsync<{ user_id: string }>(
            "SELECT user_id FROM app_settings WHERE onboarding_completed_at IS NOT NULL LIMIT 1",
        )
            .then((row) => {
                if (active) {
                    setState(row ? "ready" : "onboarding");
                }
            })
            .catch(() => {
                if (active) {
                    setState("onboarding");
                }
            });

        return () => {
            active = false;
        };
    }, [db]);

    if (state === "loading") {
        return <View />;
    }

    if (state === "onboarding") {
        return <Redirect href="/(onboarding)/welcome" />;
    }

    return <Redirect href="/(tabs)" />;
}
