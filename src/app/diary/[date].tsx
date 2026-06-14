import { useLocalSearchParams, useRouter } from "expo-router";

import DiaryEntry from "@/features/diary/DiaryEntry";

export default function DiaryEntryRoute() {
    const { date } = useLocalSearchParams<{ date: string }>();
    const router = useRouter();
    const entryDate = Array.isArray(date) ? date[0] : date;

    return <DiaryEntry date={entryDate ?? ""} onBack={() => router.back()} />;
}
