import { useRouter } from "expo-router";
import type { Href } from "expo-router";

import IntentScreen from "@/features/onboarding/intent/IntentScreen";

export default function IntentRoute() {
    const router = useRouter();

    return <IntentScreen onPush={(href) => router.push(href as Href)} />;
}
