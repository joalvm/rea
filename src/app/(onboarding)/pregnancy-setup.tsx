import { useRouter } from "expo-router";
import type { Href } from "expo-router";

import PregnancySetupScreen from "@/features/onboarding/pregnancy-setup/PregnancySetupScreen";

export default function PregnancySetupRoute() {
    const router = useRouter();

    return <PregnancySetupScreen onPush={(href) => router.push(href as Href)} />;
}
