import { useRouter } from "expo-router";

import ContraceptionScreen from "@/features/onboarding/contraception/ContraceptionScreen";

export default function ContraceptionRoute() {
    const router = useRouter();

    return <ContraceptionScreen onContinue={() => router.push("/(onboarding)/goal")} />;
}
