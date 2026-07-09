import { useRouter } from "expo-router";

import BodyScreen from "@/features/checkin/body/BodyScreen";

export default function BodyRoute() {
    const router = useRouter();

    return <BodyScreen onContinue={() => router.push("/checkin/symptoms")} />;
}
