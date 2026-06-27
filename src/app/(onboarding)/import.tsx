import { useRouter } from "expo-router";

import ImportScreen from "@/features/onboarding/import/ImportScreen";

export default function ImportRoute() {
    const router = useRouter();

    return <ImportScreen onContinue={() => router.replace("/(tabs)")} onBack={() => router.back()} />;
}
