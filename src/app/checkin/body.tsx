import { useRouter } from "expo-router";

import Body from "@/features/checkin/body/Body";

export default function BodyRoute() {
    const router = useRouter();

    return <Body onContinue={() => router.push("/checkin/symptoms")} />;
}
