import { useRouter } from "expo-router";
import type { Href } from "expo-router";

import CycleScreen from "@/features/onboarding/cycle/CycleScreen";

export default function CycleRoute() {
    const router = useRouter();

    return <CycleScreen onPush={(href) => router.push(href as Href)} />;
}
