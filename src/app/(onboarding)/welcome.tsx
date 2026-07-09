import { useRouter } from "expo-router";
import type { Href } from "expo-router";

import WelcomeScreen from "@/features/onboarding/welcome/WelcomeScreen";

export default function WelcomeRoute() {
    const router = useRouter();

    return <WelcomeScreen onPush={(href) => router.push(href as Href)} />;
}
