import { useRouter } from "expo-router";

import Welcome from "@/features/onboarding/welcome/Welcome";

export default function WelcomeRoute() {
    const router = useRouter();

    return (
        <Welcome
            onStart={() => router.push("/(onboarding)/birth-year")}
            onImport={() => router.push("/(onboarding)/import")}
        />
    );
}
