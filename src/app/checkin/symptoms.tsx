import { useRouter } from "expo-router";

import Symptoms from "@/features/checkin/symptoms/Symptoms";

export default function SymptomsRoute() {
    const router = useRouter();

    return <Symptoms onContinue={() => router.push("/checkin/fertility")} />;
}
