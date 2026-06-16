import { useRouter } from "expo-router";

import Fertility from "@/features/checkin/fertility/Fertility";

export default function FertilityRoute() {
    const router = useRouter();

    return <Fertility onContinue={() => router.push("/checkin/medications")} />;
}
