import { useRouter } from "expo-router";
import type { Href } from "expo-router";

import LastPeriodScreen from "@/features/onboarding/last-period/LastPeriodScreen";

export default function LastPeriodRoute() {
    const router = useRouter();

    return <LastPeriodScreen onPush={(href) => router.push(href as Href)} />;
}
