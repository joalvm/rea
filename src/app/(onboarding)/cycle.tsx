import { useRouter } from "expo-router";

import CycleScreen from "@/features/onboarding/cycle/CycleScreen";

export default function CycleRoute() {
    const router = useRouter();

    return <CycleScreen onContinue={() => router.push("/(onboarding)/regularity")} />;
}
