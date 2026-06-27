import { useRouter } from "expo-router";

import TodayScreen from "@/features/today/TodayScreen";

function todayLocalDate() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${now.getFullYear()}-${month}-${day}`;
}

export default function TodayRoute() {
    const router = useRouter();

    return (
        <TodayScreen
            onStartCheckin={() => router.push("/checkin")}
            onOpenDiary={() => router.push(`/diary/${todayLocalDate()}`)}
        />
    );
}
