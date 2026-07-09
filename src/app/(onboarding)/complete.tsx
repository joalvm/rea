import { useRouter } from "expo-router";
import type { Href } from "expo-router";

import CompleteScreen from "@/features/onboarding/complete/CompleteScreen";

export default function CompleteRoute() {
    const router = useRouter();

    function handleReplace(href: string) {
        router.replace(href as Href);
    }

    return <CompleteScreen onReplace={handleReplace} />;
}
