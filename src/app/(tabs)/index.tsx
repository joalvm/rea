import { useRouter } from "expo-router";

import Today from "@/features/today/Today";

function todayLocalDate() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${now.getFullYear()}-${month}-${day}`;
}

export default function TodayRoute() {
    const router = useRouter();

    return (
        <Today
            onStartCheckin={() => router.push("/checkin")}
            onOpenDiary={() => router.push(`/diary/${todayLocalDate()}`)}
        />
    );
}
