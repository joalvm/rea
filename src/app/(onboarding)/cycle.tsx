import { useRouter } from "expo-router";

import Cycle from "@/features/onboarding/cycle/Cycle";

export default function CycleRoute() {
    const router = useRouter();

    return <Cycle onContinue={() => router.push("/(onboarding)/regularity")} />;
}
