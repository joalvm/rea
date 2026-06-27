import { useRouter } from "expo-router";

import LastPeriodScreen from "@/features/onboarding/last-period/LastPeriodScreen";

export default function LastPeriodRoute() {
    const router = useRouter();

    return <LastPeriodScreen onContinue={() => router.push("/(onboarding)/cycle")} />;
}
