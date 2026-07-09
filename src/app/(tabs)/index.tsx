import { useRouter } from "expo-router";

import HomeScreen from "@/features/home/HomeScreen";

function currentLocalDate() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${now.getFullYear()}-${month}-${day}`;
}

export default function HomeRoute() {
    const router = useRouter();

    return (
        <HomeScreen
            onStartCheckin={() => router.push("/checkin")}
            onOpenDiary={() => router.push(`/diary/${currentLocalDate()}`)}
        />
    );
}
