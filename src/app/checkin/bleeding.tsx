import { useRouter } from "expo-router";

import Bleeding from "@/features/checkin/bleeding/Bleeding";

export default function BleedingRoute() {
    const router = useRouter();

    return <Bleeding onContinue={() => router.push("/checkin/feelings")} />;
}
