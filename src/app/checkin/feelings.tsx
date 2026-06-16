import { useRouter } from "expo-router";

import Feelings from "@/features/checkin/feelings/Feelings";

export default function FeelingsRoute() {
    const router = useRouter();

    return <Feelings onContinue={() => router.push("/checkin/body")} />;
}
