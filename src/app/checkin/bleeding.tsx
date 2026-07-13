import { useRouter } from "expo-router";

import BleedingScreen from "@/features/checkin/bleeding/BleedingScreen";

export default function BleedingRoute() {
    const router = useRouter();

    return (
        <BleedingScreen
            onContinue={() => router.push("/checkin/feelings")}
            onSaved={() => router.replace("/(tabs)")}
        />
    );
}
