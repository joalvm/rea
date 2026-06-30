import { useRouter } from "expo-router";
import type { Href } from "expo-router";

import NotificationsScreen from "@/features/onboarding/notifications/NotificationsScreen";

export default function NotificationsRoute() {
    const router = useRouter();

    return <NotificationsScreen onPush={(href) => router.push(href as Href)} />;
}
