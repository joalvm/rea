import { useRouter } from "expo-router";

import Goal from "@/features/onboarding/goal/Goal";

export default function GoalRoute() {
    const router = useRouter();

    return <Goal onContinue={() => router.push("/(onboarding)/notifications")} />;
}
