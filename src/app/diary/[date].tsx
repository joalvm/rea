import { type Href, useLocalSearchParams, useRouter } from "expo-router";

import DiaryEntryScreen from "@/features/diary/entry/DiaryEntryScreen";

export default function DiaryEntryRoute() {
    const { date } = useLocalSearchParams<{ date: string }>();
    const router = useRouter();
    const entryDate = Array.isArray(date) ? date[0] : date;

    return (
        <DiaryEntryScreen
            date={entryDate ?? ""}
            onStartCheckin={() => router.push("/checkin")}
            onEdit={(id) => router.push({ pathname: "/checkin/edit/[id]", params: { id } } as unknown as Href)}
        />
    );
}
