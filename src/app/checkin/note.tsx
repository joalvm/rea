import { useRouter } from "expo-router";

import Note from "@/features/checkin/note/Note";

export default function NoteRoute() {
    const router = useRouter();

    return <Note onContinue={() => router.push("/checkin/review")} />;
}
