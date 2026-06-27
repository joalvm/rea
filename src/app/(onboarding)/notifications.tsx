import { useRouter } from "expo-router";

import NotificationsScreen from "@/features/onboarding/notifications/NotificationsScreen";

export default function NotificationsRoute() {
    const router = useRouter();

    return <NotificationsScreen onContinue={() => router.push("/(onboarding)/complete")} />;
}
