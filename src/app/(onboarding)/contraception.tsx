import { useRouter } from "expo-router";

import Contraception from "@/features/onboarding/contraception/Contraception";

export default function ContraceptionRoute() {
    const router = useRouter();

    return <Contraception onContinue={() => router.push("/(onboarding)/goal")} />;
}
