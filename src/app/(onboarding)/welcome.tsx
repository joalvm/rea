import { useRouter } from "expo-router";

import WelcomeScreen from "@/features/onboarding/welcome/WelcomeScreen";

export default function WelcomeRoute() {
    const router = useRouter();

    return (
        <WelcomeScreen
            onStart={() => router.push("/(onboarding)/birth-year")}
            onImport={() => router.push("/(onboarding)/import")}
        />
    );
}
