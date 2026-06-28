import { useRouter } from "expo-router";
import type { Href } from "expo-router";

import ProfileScreen from "@/features/onboarding/profile/ProfileScreen";

export default function ProfileRoute() {
    const router = useRouter();

    return <ProfileScreen onBack={() => router.back()} onPush={(href) => router.push(href as Href)} />;
}
