import { useRouter } from "expo-router";

import GoalScreen from "@/features/onboarding/goal/GoalScreen";

export default function GoalRoute() {
    const router = useRouter();

    return <GoalScreen onContinue={() => router.push("/(onboarding)/notifications")} />;
}
