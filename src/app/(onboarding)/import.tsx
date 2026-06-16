import { useRouter } from "expo-router";

import Import from "@/features/onboarding/import/Import";

export default function ImportRoute() {
    const router = useRouter();

    return <Import onContinue={() => router.replace("/(tabs)")} onBack={() => router.back()} />;
}
