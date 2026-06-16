import { useRouter } from "expo-router";

import Notifications from "@/features/onboarding/notifications/Notifications";

export default function NotificationsRoute() {
    const router = useRouter();

    return <Notifications onContinue={() => router.push("/(onboarding)/complete")} />;
}
