import { useRouter } from "expo-router";

import Today from "@/features/today/Today";

export default function TodayRoute() {
    const router = useRouter();

    return <Today onOpenDiary={() => router.push("/diary/2026-06-06")} />;
}
