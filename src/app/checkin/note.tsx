import { useRouter } from "expo-router";

import NoteScreen from "@/features/checkin/note/NoteScreen";

export default function NoteRoute() {
    const router = useRouter();

    return (
        <NoteScreen
            onContinue={() => router.push("/checkin/review")}
            onSaved={() => router.replace("/(tabs)")}
        />
    );
}
