import { useRouter } from "expo-router";

import BirthYearScreen from "@/features/onboarding/birth-year/BirthYearScreen";

export default function BirthYearRoute() {
    const router = useRouter();

    return <BirthYearScreen onContinue={() => router.push("/(onboarding)/last-period")} />;
}
