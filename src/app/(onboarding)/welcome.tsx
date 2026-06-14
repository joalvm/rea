import { useRouter } from "expo-router";

import Welcome from "@/features/onboarding/Welcome";

export default function WelcomeRoute() {
    const router = useRouter();

    return <Welcome onContinue={() => router.push("/(onboarding)/complete")} />;
}
