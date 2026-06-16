import { useRouter } from "expo-router";

import BirthYear from "@/features/onboarding/birth-year/BirthYear";

export default function BirthYearRoute() {
    const router = useRouter();

    return <BirthYear onContinue={() => router.push("/(onboarding)/last-period")} />;
}
