import { useRouter } from "expo-router";

import Complete from "@/features/onboarding/Complete";

export default function OnboardingCompleteRoute() {
    const router = useRouter();

    return <Complete onFinish={() => router.replace("/(tabs)")} />;
}
