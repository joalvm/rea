import { useRouter } from "expo-router";
import type { Href } from "expo-router";

import RegularityScreen from "@/features/onboarding/regularity/RegularityScreen";

export default function RegularityRoute() {
    const router = useRouter();

    return <RegularityScreen onBack={() => router.back()} onPush={(href) => router.push(href as Href)} />;
}
