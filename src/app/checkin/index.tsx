import { useRouter } from "expo-router";

import CheckinIntro from "@/features/checkin/intro/CheckinIntro";

export default function CheckinIndexRoute() {
    const router = useRouter();

    return <CheckinIntro onContinue={() => router.push("/checkin/bleeding")} />;
}
