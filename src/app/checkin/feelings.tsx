import { useRouter } from "expo-router";

import FeelingsScreen from "@/features/checkin/feelings/FeelingsScreen";

export default function FeelingsRoute() {
    const router = useRouter();

    return (
        <FeelingsScreen
            onContinue={() => router.push("/checkin/body")}
            onSaved={() => router.replace("/(tabs)")}
        />
    );
}
