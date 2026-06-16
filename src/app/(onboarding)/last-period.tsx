import { useRouter } from "expo-router";

import LastPeriod from "@/features/onboarding/last-period/LastPeriod";

export default function LastPeriodRoute() {
    const router = useRouter();

    return <LastPeriod onContinue={() => router.push("/(onboarding)/cycle")} />;
}
