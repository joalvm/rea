import { useRouter } from "expo-router";

import Regularity from "@/features/onboarding/regularity/Regularity";

export default function RegularityRoute() {
    const router = useRouter();

    return <Regularity onContinue={() => router.push("/(onboarding)/contraception")} />;
}
