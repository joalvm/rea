import { useRouter } from "expo-router";
import type { Href } from "expo-router";

import ContraceptionScreen from "@/features/onboarding/contraception/ContraceptionScreen";

export default function ContraceptionRoute() {
    const router = useRouter();

    return <ContraceptionScreen onBack={() => router.back()} onPush={(href) => router.push(href as Href)} />;
}
