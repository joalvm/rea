import { useRouter } from "expo-router";

import CheckinIntroScreen from "@/features/checkin/intro/CheckinIntroScreen";

export default function CheckinIndexRoute() {
    const router = useRouter();

    return (
        <CheckinIntroScreen
            onStart={() => router.push("/checkin/bleeding")}
            onSaved={() => router.replace("/(tabs)")}
        />
    );
}
