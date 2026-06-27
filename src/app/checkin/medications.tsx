import { useRouter } from "expo-router";

import MedicationsScreen from "@/features/checkin/medications/MedicationsScreen";

export default function MedicationsRoute() {
    const router = useRouter();

    return <MedicationsScreen onContinue={() => router.push("/checkin/note")} />;
}
