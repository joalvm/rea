import { useRouter } from "expo-router";
import type { Href } from "expo-router";

import RegularityScreen from "@/features/onboarding/regularity/RegularityScreen";

export default function RegularityRoute() {
    const router = useRouter();

    return <RegularityScreen onPush={(href) => router.push(href as Href)} />;
}
