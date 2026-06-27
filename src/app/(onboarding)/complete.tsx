import { useRouter } from "expo-router";

import CompleteScreen from "@/features/onboarding/complete/CompleteScreen";

export default function OnboardingCompleteRoute() {
    const router = useRouter();

    return <CompleteScreen onFinish={() => router.replace("/(tabs)")} />;
}
