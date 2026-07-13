import { useRouter } from "expo-router";

import FertilityScreen from "@/features/checkin/fertility/FertilityScreen";

export default function FertilityRoute() {
    const router = useRouter();

    return (
        <FertilityScreen
            onContinue={() => router.push("/checkin/medications")}
            onSaved={() => router.replace("/(tabs)")}
        />
    );
}
