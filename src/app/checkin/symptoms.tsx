import { useRouter } from "expo-router";

import SymptomsScreen from "@/features/checkin/symptoms/SymptomsScreen";

export default function SymptomsRoute() {
    const router = useRouter();

    return (
        <SymptomsScreen
            onContinue={() => router.push("/checkin/fertility")}
            onSaved={() => router.replace("/(tabs)")}
        />
    );
}
