import { useRouter } from "expo-router";

import Medications from "@/features/checkin/medications/Medications";

export default function MedicationsRoute() {
    const router = useRouter();

    return <Medications onContinue={() => router.push("/checkin/note")} />;
}
