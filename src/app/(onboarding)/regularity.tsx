import { useRouter } from "expo-router";

import RegularityScreen from "@/features/onboarding/regularity/RegularityScreen";

export default function RegularityRoute() {
    const router = useRouter();

    return <RegularityScreen onContinue={() => router.push("/(onboarding)/contraception")} />;
}
